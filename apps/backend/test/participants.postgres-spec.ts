import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { Server } from 'node:http';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { TrainingModule } from '../src/training/training.module.js';
import { UserModule } from '../src/user/user.module.js';
import { StaffParticipantsModule } from '../src/participants/staff-participants.module.js';
import {
  ParticipantResponseSchema,
  BookingResponseSchema,
} from '@govolley/shared-types';
import { randomUUID } from 'node:crypto';
import { TrainingClock } from '../src/training/training-clock.js';

describe('Staff participants over HTTP with PostgreSQL', () => {
  let app: INestApplication<Server>;
  let db: PrismaService;
  let jwt: JwtService;
  let server: Server;
  const userIds: number[] = [];
  const trainingIds: number[] = [];
  beforeAll(async () => {
    const configured = process.env.TEST_DATABASE_URL;
    const target = configured && new URL(configured);
    if (
      !target ||
      !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) ||
      !target.pathname.endsWith('_test')
    )
      throw new Error('Dedicated local test database required');
    process.env.DATABASE_URL = configured;
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ NEXTAUTH_SECRET: 'participants-test-only-secret' })],
        }),
        PrismaModule,
        AuthModule,
        UserModule,
        TrainingModule,
        StaffParticipantsModule,
      ],
    })
      .overrideProvider(TrainingClock)
      .useValue({ now: () => Date.parse('2026-11-02T03:00:00Z') })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    server = app.getHttpServer();
    db = app.get(PrismaService);
    jwt = app.get(JwtService);
  });
  afterAll(async () => {
    if (db) {
      await db.training.deleteMany({ where: { id: { in: trainingIds } } });
      await db.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await app?.close();
  });
  async function account(role: 'USER' | 'COACH' | 'ADMIN' = 'USER') {
    const u = await db.user.create({
      data: { role, firstName: `Participant ${role}`, skillLevel: 'BEGINNER' },
    });
    userIds.push(u.id);
    return { ...u, token: jwt.sign({ sub: u.id, role: 'ADMIN' }) };
  }
  async function fixture() {
    const learner = await account();
    const t = await db.training.create({
      data: {
        title: 'Other coach group',
        date: new Date('2026-11-01'),
        startTime: '07:00',
        endTime: '09:00',
        targetLevel: 'BEGINNER',
        coachName: 'Another coach',
      },
    });
    trainingIds.push(t.id);
    const booking = await db.booking.create({
      data: {
        userId: learner.id,
        trainingId: t.id,
        kind: 'SINGLE_CASH',
        paymentType: 'CASH',
        cashPrice: 500,
      },
    });
    return { learner, t, booking, path: `/api/training/${t.id}/participants` };
  }
  it('allows a coach to select a learner on another coach group without exposing accounting credentials', async () => {
    const coach = await account('COACH');
    const { learner, path, booking } = await fixture();
    const response = await request(server)
      .get(path)
      .auth(coach.token, { type: 'bearer' })
      .expect(200);
    expect(response.body).toEqual([
      expect.objectContaining({
        id: booking.id,
        user: {
          id: learner.id,
          firstName: learner.firstName,
          lastName: null,
          username: null,
          skillLevel: 'BEGINNER',
        },
      }),
    ]);
  });
  it('records independent attendance and cash corrections with immutable history and stale retry identities', async () => {
    const coach = await account('COACH');
    const admin = await account('ADMIN');
    const { path, booking, learner } = await fixture();
    const write = (actor: typeof coach, body: object) =>
      request(server)
        .patch(`${path}/${booking.id}`)
        .auth(actor.token, { type: 'bearer' })
        .send(body);
    const attendance = {
      requestId: randomUUID(),
      field: 'ATTENDANCE',
      value: 'NO_SHOW',
      reason: 'Не пришёл на тренировку',
    };
    await write(coach, attendance).expect(200);
    const paid = {
      requestId: randomUUID(),
      field: 'CASH_PAYMENT',
      value: true,
      reason: 'Получено 500 наличными',
    };
    await Promise.all([
      write(admin, paid).expect(200),
      write(admin, paid).expect(200),
    ]);
    const paidOwner = await request(server)
      .get('/api/users/bookings')
      .auth(learner.token, { type: 'bearer' })
      .expect(200);
    expect(
      BookingResponseSchema.array().parse(paidOwner.body)[0],
    ).toMatchObject({
      attendanceStatus: 'NO_SHOW',
      cashReceived: true,
      paymentStatus: 'PAID',
    });
    const correction = {
      requestId: randomUUID(),
      field: 'ATTENDANCE',
      value: 'ATTENDED',
      reason: 'Уточнение: ученик пришёл позже',
    };
    await write(admin, correction).expect(200);
    const undo = {
      requestId: randomUUID(),
      field: 'CASH_PAYMENT',
      value: false,
      reason: 'Ошибка: оплатил другой ученик',
    };
    await write(coach, undo).expect(200);
    await write(coach, attendance).expect(200);
    await write(admin, paid).expect(200);
    const response = await request(server)
      .get(path)
      .auth(coach.token, { type: 'bearer' })
      .expect(200);
    const [participant] = ParticipantResponseSchema.array().parse(
      response.body,
    );
    expect(response.body).toEqual([participant]);
    expect(participant).toMatchObject({
      id: booking.id,
      status: 'CONFIRMED',
      attendanceStatus: 'ATTENDED',
      cashReceived: false,
      paymentStatus: 'UNPAID',
    });
    expect(participant.history).toEqual([
      expect.objectContaining({
        field: 'ATTENDANCE',
        oldValue: 'UNMARKED',
        newValue: 'NO_SHOW',
        reason: attendance.reason,
        actor: {
          id: coach.id,
          firstName: coach.firstName,
          lastName: null,
          username: null,
        },
      }),
      expect.objectContaining({
        field: 'CASH_PAYMENT',
        oldValue: 'UNKNOWN',
        newValue: 'true',
        reason: paid.reason,
        actor: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: null,
          username: null,
        },
      }),
      expect.objectContaining({
        field: 'ATTENDANCE',
        oldValue: 'NO_SHOW',
        newValue: 'ATTENDED',
        reason: correction.reason,
      }),
      expect.objectContaining({
        field: 'CASH_PAYMENT',
        oldValue: 'true',
        newValue: 'false',
        reason: undo.reason,
      }),
    ]);
    expect(
      participant.history.every(
        (entry) => entry.createdAt === '2026-11-02T03:00:00.000Z',
      ),
    ).toBe(true);
    await write(admin, { ...paid, value: false }).expect(409);
    await write(coach, { ...undo, requestId: randomUUID() }).expect(409);
    const own = await request(server)
      .get('/api/users/bookings')
      .auth(learner.token, { type: 'bearer' })
      .expect(200);
    expect(BookingResponseSchema.array().parse(own.body)[0]).toMatchObject({
      attendanceStatus: 'ATTENDED',
      cashReceived: false,
      paymentStatus: 'UNPAID',
    });
    expect(
      (await db.user.findUniqueOrThrow({ where: { id: learner.id } })).balance,
    ).toBe(0);
  });
  it.each(['COACH', 'ADMIN'] as const)(
    'enforces current %s rights, strict fields and scoped identities',
    async (role) => {
      const staff = await account(role);
      const ordinary = await account();
      const { path, booking, learner } = await fixture();
      const other = await fixture();
      const body = {
        requestId: randomUUID(),
        field: 'ATTENDANCE',
        value: 'ATTENDED',
        reason: 'Сверка посещения',
      };
      await request(server).get(path).expect(401);
      await request(server)
        .patch(`${path}/${booking.id}`)
        .send(body)
        .expect(401);
      await request(server)
        .get(path)
        .auth(ordinary.token, { type: 'bearer' })
        .expect(403);
      await request(server)
        .patch(`${path}/${booking.id}`)
        .auth(ordinary.token, { type: 'bearer' })
        .send(body)
        .expect(403);
      for (const invalid of [
        { ...body, actorId: ordinary.id },
        { ...body, reason: '' },
        { ...body, value: 'BAD' },
        { ...body, field: 'CASH_PAYMENT', value: 500 },
        { ...body, status: 'CANCELLED' },
      ]) {
        await request(server)
          .patch(`${path}/${booking.id}`)
          .auth(staff.token, { type: 'bearer' })
          .send(invalid)
          .expect(400);
      }
      await request(server)
        .patch(`${path}/${other.booking.id}`)
        .auth(staff.token, { type: 'bearer' })
        .send(body)
        .expect(404);
      await request(server)
        .patch(`${path}/${booking.id}`)
        .auth(staff.token, { type: 'bearer' })
        .send(body)
        .expect(200);
      await request(server)
        .patch(`${other.path}/${other.booking.id}`)
        .auth(staff.token, { type: 'bearer' })
        .send(body)
        .expect(409);
      await request(server)
        .patch(`${path}/${booking.id}`)
        .auth(staff.token, { type: 'bearer' })
        .send({ ...body, reason: 'Другая причина' })
        .expect(409);
      await db.user.update({ where: { id: staff.id }, data: { role: 'USER' } });
      await request(server)
        .get(path)
        .auth(staff.token, { type: 'bearer' })
        .expect(403);
      await request(server)
        .patch(`${path}/${booking.id}`)
        .auth(staff.token, { type: 'bearer' })
        .send(body)
        .expect(403);
      const own = await request(server)
        .get('/api/users/bookings')
        .auth(learner.token, { type: 'bearer' })
        .expect(200);
      const parsed = BookingResponseSchema.array().parse(own.body);
      expect(own.body).toEqual(parsed);
      expect(parsed[0]).toMatchObject({
        status: 'CONFIRMED',
        attendanceStatus: 'ATTENDED',
        paymentStatus: 'UNPAID',
      });
    },
  );
  it('keeps legacy receipt unknown until explicit staff action and never creates debt for cancelled cash no-show', async () => {
    const staff = await account('COACH');
    const { path, booking, learner } = await fixture();
    const legacy = await db.booking.create({
      data: {
        userId: learner.id,
        trainingId: booking.trainingId,
        status: 'CANCELLED',
        paymentType: 'BALANCE',
        cancellationTiming: 'LATE',
        cancelledAt: new Date('2026-10-31T23:00:00Z'),
      },
    });
    const read = async () =>
      ParticipantResponseSchema.array().parse(
        (
          await request(server)
            .get(path)
            .auth(staff.token, { type: 'bearer' })
            .expect(200)
        ).body,
      );
    expect((await read()).find((item) => item.id === legacy.id)).toMatchObject({
      kind: 'LEGACY',
      cashReceived: null,
      paymentStatus: 'UNRECORDED',
      attendanceStatus: 'UNMARKED',
      history: [],
    });
    for (const [field, value] of [
      ['ATTENDANCE', 'NO_SHOW'],
      ['CASH_PAYMENT', true],
      ['CASH_PAYMENT', false],
    ] as const) {
      await request(server)
        .patch(`${path}/${legacy.id}`)
        .auth(staff.token, { type: 'bearer' })
        .send({
          requestId: randomUUID(),
          field,
          value,
          reason: 'Уточнение прежней записи',
        })
        .expect(200);
    }
    expect((await read()).find((item) => item.id === legacy.id)).toMatchObject({
      status: 'CANCELLED',
      cancellationTiming: 'LATE',
      attendanceStatus: 'NO_SHOW',
      paymentStatus: 'UNPAID',
      cashPrice: null,
    });
    expect(
      (await db.user.findUniqueOrThrow({ where: { id: learner.id } })).balance,
    ).toBe(0);
    expect(
      await db.booking.count({ where: { trainingId: booking.trainingId } }),
    ).toBe(2);
  });
});
