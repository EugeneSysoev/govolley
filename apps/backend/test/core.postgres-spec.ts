import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { AuthModule } from '../src/auth/auth.module.js';
import {
  AuthSessionService,
  AUTH_SESSION_TTL_MS,
} from '../src/auth/auth-session.service.js';
import { TrainingModule } from '../src/training/training.module.js';
import { TrainingService } from '../src/training/training.service.js';
import { UserModule } from '../src/user/user.module.js';
import { z } from 'zod';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AvatarStorage } from '../src/user/avatar-storage.service.js';
import { TrainingResponseSchema } from '@govolley/shared-types';

describe('PostgreSQL concurrency and protected HTTP operations', () => {
  let app: INestApplication<Server>;
  let db: PrismaService;
  let training: TrainingService;
  let sessions: AuthSessionService;
  let jwt: JwtService;
  let server: Server;
  let uploadDirectory: string;
  const users: number[] = [];
  const trainings: number[] = [];
  const sessionIds: string[] = [];
  const dto = {
    title: 'Integration fixture',
    date: '2026-11-01T00:00:00.000Z',
    startTime: '07:00',
    endTime: '09:00',
    maxParticipants: 1,
    targetLevel: 'BEGINNER' as const,
    location: 'Karon Beach',
    coachName: 'Coach',
    price: 500 as const,
  };

  beforeAll(async () => {
    const configured = process.env.TEST_DATABASE_URL;
    if (!configured)
      throw new Error(
        'TEST_DATABASE_URL is required; use a dedicated local *_test database',
      );
    const target = new URL(configured);
    if (
      !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) ||
      !target.pathname.endsWith('_test')
    ) {
      throw new Error(
        'Integration tests require a local database ending in _test',
      );
    }
    process.env.DATABASE_URL = configured;
    uploadDirectory = await fs.mkdtemp(
      path.join(tmpdir(), 'govolley-http-avatar-'),
    );
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ NEXTAUTH_SECRET: 'integration-test-only-secret' })],
        }),
        PrismaModule,
        AuthModule,
        UserModule,
        TrainingModule,
      ],
    })
      .overrideProvider(AvatarStorage)
      .useValue(new AvatarStorage(uploadDirectory))
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    server = app.getHttpServer();
    db = app.get(PrismaService);
    training = app.get(TrainingService);
    sessions = app.get(AuthSessionService);
    jwt = app.get(JwtService);
  });
  afterAll(async () => {
    if (db) {
      await db.authSession.deleteMany({ where: { id: { in: sessionIds } } });
      await db.training.deleteMany({ where: { id: { in: trainings } } });
      await db.user.deleteMany({ where: { id: { in: users } } });
    }
    await app?.close();
    if (uploadDirectory)
      await fs.rm(uploadDirectory, { recursive: true, force: true });
  });
  async function user(role: 'USER' | 'COACH' | 'ADMIN' = 'USER') {
    const value = await db.user.create({ data: { role } });
    users.push(value.id);
    return value;
  }
  async function event(maxParticipants = 1) {
    const value = await training.create({ ...dto, maxParticipants });
    trainings.push(value.id);
    return value;
  }
  function token(id: number) {
    return jwt.sign({ sub: id, role: 'ADMIN' });
  }
  it('creates a public group with required school data and rejects missing or unset values', async () => {
    const manager = await user('COACH');
    const body = {
      ...dto,
      date: '2026-11-01T00:00:00+07:00',
      targetLevel: 'BEGINNER',
      location: ' Karon Beach ',
      coachName: ' Coach ',
      price: 500,
      description: 'Работа над приёмом',
    };
    for (const field of [
      'title',
      'date',
      'startTime',
      'endTime',
      'targetLevel',
      'maxParticipants',
      'location',
      'coachName',
      'price',
    ]) {
      const incomplete: Record<string, unknown> = { ...body };
      delete incomplete[field];
      await request(server)
        .post('/api/training')
        .auth(token(manager.id), { type: 'bearer' })
        .send(incomplete)
        .expect(400);
    }
    for (const invalid of [
      { targetLevel: 'NOT_SET' },
      { location: '   ' },
      { coachName: null },
      { price: 0 },
    ]) {
      await request(server)
        .post('/api/training')
        .auth(token(manager.id), { type: 'bearer' })
        .send({ ...body, ...invalid })
        .expect(400);
    }
    const created = await request(server)
      .post('/api/training')
      .auth(token(manager.id), { type: 'bearer' })
      .send(body)
      .expect(201);
    const saved = TrainingResponseSchema.parse(created.body);
    trainings.push(saved.id);
    const publicRead = await request(server)
      .get(`/api/training/${saved.id}`)
      .expect(200);
    expect(TrainingResponseSchema.parse(publicRead.body)).toMatchObject({
      title: dto.title,
      location: 'Karon Beach',
      coachName: 'Coach',
      price: 500,
      description: body.description,
      date: '2026-10-31T17:00:00.000Z',
      startTime: '07:00',
      endTime: '09:00',
      targetLevel: 'BEGINNER',
    });
    const list = await request(server).get('/api/training').expect(200);
    expect(TrainingResponseSchema.array().parse(list.body)).toContainEqual(
      saved,
    );
  });
  it('accepts real multipart images after the Multer upgrade and enforces type/count/size limits', async () => {
    const u = await user();
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cM04AAAAASUVORK5CYII=',
      'base64',
    );
    const first = await request(server)
      .patch('/api/users/profile')
      .auth(token(u.id), { type: 'bearer' })
      .field('firstName', 'Fixture')
      .attach('image', png, {
        filename: '../../image.png',
        contentType: 'image/png',
      })
      .expect(200);
    const firstImage = z.object({ image: z.string() }).parse(first.body).image;
    expect(await fs.readdir(uploadDirectory)).toHaveLength(1);
    const next = await request(server)
      .patch('/api/users/profile')
      .auth(token(u.id), { type: 'bearer' })
      .attach('image', png, { filename: 'next.png', contentType: 'image/png' })
      .expect(200);
    expect(z.object({ image: z.string() }).parse(next.body).image).not.toBe(
      firstImage,
    );
    expect(await fs.readdir(uploadDirectory)).toHaveLength(1);
    await request(server)
      .patch('/api/users/profile')
      .auth(token(u.id), { type: 'bearer' })
      .attach('image', Buffer.from('<svg/>'), {
        filename: 'fake.png',
        contentType: 'image/png',
      })
      .expect(400);
    await request(server)
      .patch('/api/users/profile')
      .auth(token(u.id), { type: 'bearer' })
      .attach('image', png, 'one.png')
      .attach('image', png, 'two.png')
      .expect(400);
    await request(server)
      .patch('/api/users/profile')
      .auth(token(u.id), { type: 'bearer' })
      .attach('image', Buffer.alloc(5 * 1024 * 1024 + 1), 'large.png')
      .expect(413);
    expect(await fs.readdir(uploadDirectory)).toHaveLength(1);
  });
  async function confirmed() {
    const u = await user();
    const session = await sessions.create();
    sessionIds.push(session.sessionId);
    await db.authSession.update({
      where: { id: session.sessionId },
      data: { status: 'CONFIRMED', userId: u.id },
    });
    return { id: session.sessionId, user: u };
  }

  it('serializes twenty contenders for the last place in PostgreSQL', async () => {
    const t = await event();
    const contenders = await Promise.all(
      Array.from({ length: 20 }, () => user()),
    );
    const outcomes = await Promise.allSettled(
      contenders.map((u) => training.createBooking(u.id, t.id)),
    );
    expect(outcomes.filter((o) => o.status === 'fulfilled')).toHaveLength(1);
    for (const outcome of outcomes) {
      if (outcome.status === 'rejected')
        expect(outcome.reason).toMatchObject({ status: 409 });
    }
    expect(
      await db.booking.count({
        where: { trainingId: t.id, status: 'CONFIRMED' },
      }),
    ).toBe(1);
  });
  it('makes retries idempotent, allows cancellation and rebooking, and rejects inactive training', async () => {
    const t = await event();
    const u = await user();
    await Promise.all([
      training.createBooking(u.id, t.id),
      training.createBooking(u.id, t.id),
    ]);
    expect((await training.findOne(t.id, u.id)).currentParticipants).toBe(1);
    await Promise.all([
      training.cancelBooking(u.id, t.id),
      training.cancelBooking(u.id, t.id),
    ]);
    expect((await training.createBooking(u.id, t.id)).isBooked).toBe(true);
    await training.remove(t.id);
    await expect(training.createBooking(u.id, t.id)).rejects.toMatchObject({
      status: 409,
    });
    expect((await training.findOne(t.id, u.id)).isBooked).toBe(true);
    expect((await training.cancelBooking(u.id, t.id)).isBooked).toBe(false);
  });
  it('serializes capacity reduction with booking and soft deletion', async () => {
    for (let iteration = 0; iteration < 8; iteration++) {
      const t = await event(2);
      const a = await user();
      const b = await user();
      await training.createBooking(a.id, t.id);
      await Promise.allSettled([
        training.update(t.id, { maxParticipants: 1 }),
        training.createBooking(b.id, t.id),
      ]);
      const state = await training.findOne(t.id);
      expect(state.currentParticipants).toBeLessThanOrEqual(
        state.maxParticipants,
      );
      await Promise.allSettled([
        training.remove(t.id),
        training.createBooking(b.id, t.id),
      ]);
      await expect(training.createBooking(b.id, t.id)).rejects.toMatchObject({
        status: 409,
      });
    }
  });
  it('checks merged start/end times on partial update', async () => {
    const t = await event();
    await expect(
      training.update(t.id, { startTime: '10:00' }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it.each(['COACH', 'ADMIN'] as const)(
    'returns viewer-specific booking state on PATCH/DELETE for %s without exposing participants',
    async (role) => {
      const t = await event();
      const booked = await user(role);
      const unbooked = await user(role);
      await request(server)
        .post('/api/training/book')
        .auth(token(booked.id), { type: 'bearer' })
        .send({ trainingId: t.id })
        .expect(201);
      for (const method of ['patch', 'delete'] as const) {
        for (const [viewer, isBooked] of [
          [booked, true],
          [unbooked, false],
        ] as const) {
          const result = await request(server)
            [method](`/api/training/${t.id}`)
            .auth(token(viewer.id), { type: 'bearer' })
            .send(method === 'patch' ? { title: 'Staff update' } : {})
            .expect(200);
          const parsed = TrainingResponseSchema.parse(result.body);
          expect(parsed).toMatchObject({ isBooked, currentParticipants: 1 });
          expect(result.body).toEqual(parsed);
          const read = await request(server)
            .get(`/api/training/${t.id}`)
            .auth(token(viewer.id), { type: 'bearer' })
            .expect(200);
          expect(TrainingResponseSchema.parse(read.body)).toEqual(parsed);
        }
      }
      const publicRead = await request(server)
        .get(`/api/training/${t.id}`)
        .expect(200);
      const publicTraining = TrainingResponseSchema.parse(publicRead.body);
      expect(publicTraining).toMatchObject({
        isBooked: false,
        currentParticipants: 1,
        isActive: false,
      });
      expect(publicRead.body).toEqual(publicTraining);
      const bookings = await request(server)
        .get('/api/users/bookings')
        .auth(token(booked.id), { type: 'bearer' })
        .expect(200);
      const savedBookings = z
        .array(
          z.object({
            status: z.string(),
            training: z.object({ id: z.number(), isActive: z.boolean() }),
          }),
        )
        .parse(bookings.body);
      expect(savedBookings).toContainEqual({
        status: 'CONFIRMED',
        training: { id: t.id, isActive: false },
      });
      const cancelled = await request(server)
        .post('/api/training/unbook')
        .auth(token(booked.id), { type: 'bearer' })
        .send({ trainingId: t.id })
        .expect(201);
      expect(TrainingResponseSchema.parse(cancelled.body)).toMatchObject({
        isBooked: false,
        currentParticipants: 0,
      });
    },
  );
  it('keeps omitted PATCH fields, allows clearing description, and rejects clearing required data', async () => {
    const t = await event();
    const manager = await user('COACH');
    const endpoint = `/api/training/${t.id}`;
    await request(server)
      .patch(endpoint)
      .auth(token(manager.id), { type: 'bearer' })
      .send({
        location: 'Beach',
        coachName: 'Coach',
        description: 'Saved',
        price: 500,
      })
      .expect(200);
    const omitted = await request(server)
      .patch(endpoint)
      .auth(token(manager.id), { type: 'bearer' })
      .send({ title: 'Renamed' })
      .expect(200);
    expect(TrainingResponseSchema.parse(omitted.body)).toMatchObject({
      location: 'Beach',
      coachName: 'Coach',
      description: 'Saved',
      price: 500,
    });
    for (const body of [
      { location: null },
      { location: '   ' },
      { coachName: null },
      { coachName: '' },
      { price: null },
      { price: 400 },
      { targetLevel: 'NOT_SET' },
    ]) {
      await request(server)
        .patch(endpoint)
        .auth(token(manager.id), { type: 'bearer' })
        .send(body)
        .expect(400);
    }
    const cleared = await request(server)
      .patch(endpoint)
      .auth(token(manager.id), { type: 'bearer' })
      .send({ description: null })
      .expect(200);
    expect(TrainingResponseSchema.parse(cleared.body)).toMatchObject({
      location: 'Beach',
      coachName: 'Coach',
      description: null,
      price: 500,
    });
  });
  it('reads legacy incomplete groups without inventing price, level, location or coach', async () => {
    for (const location of [null, '', '   ']) {
      const legacy = await db.training.create({
        data: {
          title: 'Legacy',
          date: new Date('2026-10-31T18:00:00Z'),
          startTime: '07:00',
          endTime: '09:00',
          maxParticipants: 10,
          location,
        },
      });
      trainings.push(legacy.id);
      const result = await request(server)
        .get(`/api/training/${legacy.id}`)
        .expect(200);
      expect(TrainingResponseSchema.parse(result.body)).toMatchObject({
        location,
        coachName: null,
        price: null,
        targetLevel: 'NOT_SET',
        date: '2026-10-31T18:00:00.000Z',
      });
    }
  });
  it('accepts calendar dates and offset timestamps as the same Bangkok day on create and update', async () => {
    const manager = await user('COACH');
    const created = await request(server)
      .post('/api/training')
      .auth(token(manager.id), { type: 'bearer' })
      .send({ ...dto, date: '2026-11-01' })
      .expect(201);
    const saved = TrainingResponseSchema.parse(created.body);
    trainings.push(saved.id);
    expect(saved.date).toBe('2026-10-31T17:00:00.000Z');
    const updated = await request(server)
      .patch(`/api/training/${saved.id}`)
      .auth(token(manager.id), { type: 'bearer' })
      .send({ date: '2026-10-31T18:00:00Z' })
      .expect(200);
    expect(TrainingResponseSchema.parse(updated.body).date).toBe(
      '2026-10-31T17:00:00.000Z',
    );
  });
  it.each(['post', 'patch', 'delete'] as const)(
    'enforces 401/403/allowed role on %s',
    async (method) => {
      const t = await event();
      const ordinary = await user();
      const manager = await user('COACH');
      const path =
        method === 'post' ? '/api/training' : `/api/training/${t.id}`;
      const body = method === 'post' ? dto : { title: 'Updated' };
      await request(server)[method](path).send(body).expect(401);
      await request(server)
        [method](path)
        .auth(token(ordinary.id), { type: 'bearer' })
        .send(body)
        .expect(403);
      const result = await request(server)
        [method](path)
        .auth(token(manager.id), { type: 'bearer' })
        .send(body)
        .expect(method === 'post' ? 201 : 200);
      if (method === 'post')
        trainings.push(z.object({ id: z.number() }).parse(result.body).id);
      await db.user.update({
        where: { id: manager.id },
        data: { role: 'USER' },
      });
      await request(server)
        [method](path)
        .auth(token(manager.id), { type: 'bearer' })
        .send(body)
        .expect(403);
    },
  );
  it('rejects invalid HTTP payloads and profile privilege escalation', async () => {
    const manager = await user('ADMIN');
    const t = await event();
    for (const body of [
      { ...dto, maxParticipants: 0 },
      { ...dto, date: 'bad' },
      { ...dto, id: 123 },
    ]) {
      await request(server)
        .post('/api/training')
        .auth(token(manager.id), { type: 'bearer' })
        .send(body)
        .expect(400);
    }
    for (const body of [
      { price: -1 },
      { currentParticipants: 0 },
      { endTime: 'bad' },
      {},
    ]) {
      await request(server)
        .patch(`/api/training/${t.id}`)
        .auth(token(manager.id), { type: 'bearer' })
        .send(body)
        .expect(400);
    }
    await request(server)
      .post('/api/training/book')
      .auth(token(manager.id), { type: 'bearer' })
      .send({ trainingId: -1 })
      .expect(400);
    for (const body of [
      { role: 'ADMIN' },
      { isLevelVerified: true },
      { image: '/uploads/../../src/main.ts' },
      { skillLevel: 'ADVANCED' },
    ]) {
      await request(server)
        .patch('/api/users/profile')
        .auth(token(manager.id), { type: 'bearer' })
        .send(body)
        .expect(400);
    }
  });
  it('allows exactly one concurrent auth exchange and keeps verified level at login', async () => {
    const s = await confirmed();
    await db.user.update({
      where: { id: s.user.id },
      data: { isLevelVerified: true, skillLevel: 'ADVANCED' },
    });
    const outcomes = await Promise.allSettled(
      Array.from({ length: 10 }, () => sessions.exchange(s.id)),
    );
    const successes = outcomes.filter((o) => o.status === 'fulfilled');
    expect(successes).toHaveLength(1);
    expect(successes[0]).toMatchObject({
      value: { isLevelVerified: true, skillLevel: 'ADVANCED' },
    });
    await expect(
      sessions.confirm(s.id, { id: 5, first_name: 'Replay' }),
    ).rejects.toMatchObject({ status: 401 });
    await expect(sessions.exchange(s.id)).rejects.toMatchObject({
      status: 401,
    });
  });
  it('rejects expired pending and confirmed sessions at the same TTL', async () => {
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    try {
      for (const status of ['PENDING', 'CONFIRMED']) {
        const s = await confirmed();
        await db.authSession.update({
          where: { id: s.id },
          data: { status, createdAt: new Date(now - AUTH_SESSION_TTL_MS) },
        });
        expect(await sessions.status(s.id)).toEqual({ status: 'expired' });
        await expect(
          sessions.confirm(s.id, { id: 6, first_name: 'Expired' }),
        ).rejects.toMatchObject({ status: 401 });
        await expect(sessions.exchange(s.id)).rejects.toMatchObject({
          status: 401,
        });
      }
      await sessions.cleanup();
    } finally {
      clock.mockRestore();
    }
  });
  it('rolls back consumption if token signing fails; successful issuance cannot be repeated', async () => {
    const s = await confirmed();
    jest
      .spyOn(jwt, 'signAsync')
      .mockRejectedValueOnce(new Error('simulated signing failure'));
    await expect(sessions.exchange(s.id)).rejects.toThrow(
      'simulated signing failure',
    );
    expect(await sessions.status(s.id)).toEqual({ status: 'confirmed' });
    await sessions.exchange(s.id);
    expect(await sessions.status(s.id)).toEqual({ status: 'consumed' });
  });
  it('prevents a second Telegram identity from taking over a confirmed session', async () => {
    const session = await sessions.create();
    sessionIds.push(session.sessionId);
    const identity = {
      id: Math.floor(Math.random() * 1000000000),
      first_name: 'Fixture',
      username: randomUUID().slice(0, 10),
    };
    await sessions.confirm(session.sessionId, identity);
    const bound = await db.authSession.findUniqueOrThrow({
      where: { id: session.sessionId },
    });
    if (bound.userId) users.push(bound.userId);
    await expect(
      sessions.confirm(session.sessionId, { ...identity, id: identity.id + 1 }),
    ).rejects.toMatchObject({ status: 401 });
    expect(
      (
        await db.authSession.findUniqueOrThrow({
          where: { id: session.sessionId },
        })
      ).userId,
    ).toBe(bound.userId);
  });
});
