import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { fork } from 'node:child_process';
import path from 'node:path';
import { z } from 'zod';
import {
  NotificationListSchema,
  TrainingResponseSchema,
} from '@govolley/shared-types';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { TrainingModule } from '../src/training/training.module.js';
import { NotificationDeliveryDriver } from '../src/notifications/notification-delivery.js';
import type { NotificationTransport } from '../src/notifications/notification-transport.js';
import { NotificationTransportError } from '../src/notifications/notification-transport.js';

describe('Durable booking notifications over HTTP and PostgreSQL', () => {
  let app: INestApplication<Server>;
  let db: PrismaService;
  let server: Server;
  let token: string;
  let staff: string;
  let admin: string;
  let now = Date.now();
  const users: number[] = [];
  const trainings: number[] = [];
  async function openApp() {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ NEXTAUTH_SECRET: 'notifications-test-secret' })],
        }),
        PrismaModule,
        AuthModule,
        TrainingModule,
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    server = app.getHttpServer();
    db = app.get(PrismaService);
  }
  beforeAll(async () => {
    const configured = process.env.TEST_DATABASE_URL;
    const target = configured && new URL(configured);
    if (
      !target ||
      !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) ||
      !target.pathname.endsWith('_test')
    )
      throw new Error('Dedicated local TEST_DATABASE_URL required');
    process.env.DATABASE_URL = configured;
    await openApp();
    const jwt = app.get(JwtService);
    for (const role of ['USER', 'COACH', 'ADMIN'] as const) {
      const user = await db.user.create({
        data: {
          role,
          skillLevel: 'BEGINNER',
          telegramId: `notification-${randomUUID()}`,
        },
      });
      users.push(user.id);
      const signed = jwt.sign({ sub: user.id });
      if (role === 'USER') token = signed;
      else if (role === 'COACH') staff = signed;
      else admin = signed;
    }
  });
  beforeEach(() => {
    now = Date.now() + 1000;
  });
  afterEach(async () => {
    await db.training.deleteMany({ where: { id: { in: trainings } } });
    trainings.length = 0;
  });
  afterAll(async () => {
    await db?.user.deleteMany({ where: { id: { in: users } } });
    await app?.close();
  });
  async function event(title = 'Утренняя группа') {
    const training = await db.training.create({
      data: {
        title,
        date: new Date('2099-11-01T00:00:00Z'),
        startTime: '07:00',
        endTime: '09:00',
        targetLevel: 'BEGINNER',
      },
    });
    trainings.push(training.id);
    return training;
  }
  async function book(trainingId: number, requestId = randomUUID()) {
    const response = await request(server)
      .post('/api/training/book')
      .auth(token, { type: 'bearer' })
      .send({ trainingId, requestId })
      .expect(201);
    return TrainingResponseSchema.parse(response.body);
  }
  async function list(query = '') {
    const response = await request(server)
      .get(`/api/notifications${query}`)
      .auth(staff, { type: 'bearer' })
      .expect(200);
    return NotificationListSchema.parse(response.body);
  }
  function worker(transport: NotificationTransport) {
    return new NotificationDeliveryDriver(db, transport, { now: () => now });
  }
  function child(mode: 'deliver' | 'crash') {
    return new Promise<string[]>((resolve, reject) => {
      const process = fork(
        path.resolve('../../scripts/notification-worker-fixture.mjs'),
        [mode],
        {
          env: {
            ...globalThis.process.env,
            TEST_NOTIFICATION_NOW: String(now),
          },
          stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
        },
      );
      let result: string[] = [];
      let expectedKill = false;
      let stderr = '';
      process.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      const timeout = setTimeout(() => {
        process.kill();
        reject(new Error('Worker fixture timeout'));
      }, 15_000);
      process.on('error', reject);
      process.on('message', (message: unknown) => {
        if (z.object({ claimed: z.literal(true) }).safeParse(message).success) {
          expectedKill = true;
          process.kill('SIGKILL');
        } else
          result = z
            .object({
              messages: z.array(
                z.object({ text: z.string(), recipient: z.string() }),
              ),
            })
            .parse(message)
            .messages.map((item) => item.text);
      });
      process.on('exit', (code) => {
        clearTimeout(timeout);
        if (code === 0 || expectedKill) resolve(result);
        else reject(new Error(`Worker failed: ${stderr}`));
      });
    });
  }
  it('creates distinct booking/cancellation intents only for real transitions, including rebooking and stale retries', async () => {
    const training = await event();
    const requestId = randomUUID();
    const responses = await Promise.all([
      book(training.id, requestId),
      book(training.id, requestId),
    ]);
    expect(responses[0].bookingId).toBe(responses[1].bookingId);
    const bookingId = responses[0].bookingId;
    for (let i = 0; i < 2; i++)
      await request(server)
        .post('/api/training/unbook')
        .auth(token, { type: 'bearer' })
        .send({ trainingId: training.id, bookingId })
        .expect(201);
    const second = await book(training.id);
    expect(second.bookingId).not.toBe(bookingId);
    await book(training.id, requestId);
    await request(server)
      .post('/api/training/unbook')
      .auth(token, { type: 'bearer' })
      .send({ trainingId: training.id, bookingId })
      .expect(201);
    const items = (await list()).items;
    expect(items).toHaveLength(3);
    expect(
      items.filter((item) => item.kind === 'BOOKING_CONFIRMED'),
    ).toHaveLength(2);
    expect(items.find((item) => item.kind === 'BOOKING_CANCELLED')?.text).toBe(
      'Ваша запись отменена.\nУтренняя группа\n01.11.2099, 07:00–09:00 — время Пхукета (Asia/Bangkok).',
    );
    const current = TrainingResponseSchema.parse(
      (
        await request(server)
          .get(`/api/training/${training.id}`)
          .auth(token, { type: 'bearer' })
          .expect(200)
      ).body,
    );
    expect(current.bookingId).toBe(second.bookingId);
  });
  it('keeps accepted accounting/history unchanged after failure and retries the immutable snapshot', async () => {
    const training = await event('Повтор доставки');
    await book(training.id);
    const before = await db.booking.findMany({
      where: { trainingId: training.id },
    });
    let fail = true;
    const sent: string[] = [];
    const driver = worker({
      send(message) {
        sent.push(message.text);
        return fail
          ? Promise.reject(new Error('secret token URL'))
          : Promise.resolve();
      },
    });
    await driver.dispatchDue();
    expect((await list()).items[0]).toMatchObject({
      status: 'RETRY',
      attempts: 1,
      lastError: 'TELEGRAM_UNAVAILABLE',
    });
    expect(JSON.stringify(await list())).not.toContain('secret token');
    await db.training.update({
      where: { id: training.id },
      data: { title: 'Changed after commit', startTime: '12:00' },
    });
    fail = false;
    now += 60_000;
    await driver.dispatchDue();
    expect(sent).toEqual(
      Array(2).fill(
        'Запись подтверждена.\nПовтор доставки\n01.11.2099, 07:00–09:00 — время Пхукета (Asia/Bangkok).',
      ),
    );
    expect(
      await db.booking.findMany({ where: { trainingId: training.id } }),
    ).toEqual(before);
    expect((await list()).items[0]).toMatchObject({
      status: 'DELIVERED',
      attempts: 2,
      lastError: null,
    });
    expect((await list('?undelivered=true')).items).toHaveLength(0);
  });
  it('denies anonymous and USER access and rereads COACH/ADMIN roles for an old token', async () => {
    await book((await event()).id);
    await request(server).get('/api/notifications').expect(401);
    await request(server)
      .get('/api/notifications')
      .auth(token, { type: 'bearer' })
      .expect(403);
    await request(server)
      .get('/api/notifications')
      .auth(admin, { type: 'bearer' })
      .expect(200);
    const view = await list();
    expect(JSON.stringify(view)).not.toContain('recipient');
    expect(JSON.stringify(view)).not.toContain('telegramId');
    await db.user.update({ where: { id: users[1] }, data: { role: 'USER' } });
    try {
      await request(server)
        .get('/api/notifications')
        .auth(staff, { type: 'bearer' })
        .expect(403);
    } finally {
      await db.user.update({
        where: { id: users[1] },
        data: { role: 'COACH' },
      });
    }
    for (const query of [
      '?beforeId=0',
      '?beforeId=2147483648',
      '?undelivered=oops',
    ])
      await request(server)
        .get(`/api/notifications${query}`)
        .auth(staff, { type: 'bearer' })
        .expect(400);
  });
  it('shows missing Telegram recipient without rolling back the booking or inventing a destination', async () => {
    const user = await db.user.update({
      where: { id: users[0] },
      data: { telegramId: null },
    });
    await book((await event()).id);
    const sent: string[] = [];
    await worker({
      send(message) {
        sent.push(message.recipient);
        return Promise.resolve();
      },
    }).dispatchDue();
    expect(sent).toEqual([]);
    expect((await list()).items[0]).toMatchObject({
      status: 'UNDELIVERABLE',
      attempts: 0,
      lastError: 'NO_RECIPIENT',
      userId: user.id,
    });
    await db.user.update({
      where: { id: users[0] },
      data: { telegramId: `notification-${randomUUID()}` },
    });
  });
  it('honors rate-limit retry_after and never retries before its durable deadline', async () => {
    await book((await event()).id);
    const driver = worker({
      send() {
        return Promise.reject(
          new NotificationTransportError('RATE_LIMITED', 120_000),
        );
      },
    });
    await driver.dispatchDue();
    now += 60_000;
    await driver.dispatchDue();
    expect((await list()).items[0]).toMatchObject({
      attempts: 1,
      status: 'RETRY',
      lastError: 'RATE_LIMITED',
    });
    now += 61_000;
    await worker({ send: () => Promise.resolve() }).dispatchDue();
    expect((await list()).items[0]).toMatchObject({
      status: 'DELIVERED',
      attempts: 2,
    });
  });
  it('bounds a stalled transport by aborting it and retains the notification for retry', async () => {
    await book((await event()).id);
    let aborted = false;
    await worker({
      send(message) {
        return new Promise((_, reject) => {
          message.signal.addEventListener('abort', () => {
            aborted = true;
            reject(new NotificationTransportError('TIMEOUT'));
          });
        });
      },
    }).dispatchDue();
    expect(aborted).toBe(true);
    expect((await list()).items[0]).toMatchObject({
      status: 'RETRY',
      lastError: 'TIMEOUT',
    });
  });
  it('delivers committed work after shutting down the creator and starting a fresh worker process', async () => {
    await book((await event('После перезапуска')).id);
    await app.close();
    try {
      expect(await child('deliver')).toEqual([
        'Запись подтверждена.\nПосле перезапуска\n01.11.2099, 07:00–09:00 — время Пхукета (Asia/Bangkok).',
      ]);
    } finally {
      await openApp();
    }
    expect((await list()).items[0]).toMatchObject({
      status: 'DELIVERED',
      attempts: 1,
    });
  });
  it('recovers an expired lease after killing a worker after claim/before acknowledgement', async () => {
    await book((await event()).id);
    await child('crash');
    expect((await list()).items[0]).toMatchObject({
      status: 'PROCESSING',
      attempts: 1,
    });
    expect(await child('deliver')).toEqual([]);
    now += 61_000;
    expect(await child('deliver')).toHaveLength(1);
    expect((await list()).items[0]).toMatchObject({
      status: 'DELIVERED',
      attempts: 2,
    });
  });
  it('coordinates two workers and prevents a stale completion from overwriting a new lease result', async () => {
    await book((await event()).id);
    let release!: () => void;
    let claimed!: () => void;
    const reached = new Promise<void>((resolve) => {
      claimed = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const old = worker({
      async send() {
        claimed();
        await held;
      },
    });
    const running = old.dispatchDue();
    await reached;
    const attempts: string[] = [];
    const newer = worker({
      send(message) {
        attempts.push(message.text);
        return Promise.reject(new Error('Controlled failure'));
      },
    });
    await newer.dispatchDue();
    expect(attempts).toHaveLength(0);
    now += 61_000;
    await newer.dispatchDue();
    expect(attempts).toHaveLength(1);
    release();
    await running;
    expect((await list()).items[0]).toMatchObject({
      status: 'RETRY',
      attempts: 2,
    });
    now += 61_000;
    await worker({ send: () => Promise.resolve() }).dispatchDue();
    expect((await list()).items[0]).toMatchObject({
      status: 'DELIVERED',
      attempts: 3,
    });
  });
});
