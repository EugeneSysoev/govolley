import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { Server } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { UserModule } from '../src/user/user.module.js';
import { TrainingModule } from '../src/training/training.module.js';

describe('Administrator coach management over HTTP with PostgreSQL', () => {
  let app: INestApplication<Server>;
  let db: PrismaService;
  let jwt: JwtService;
  let server: Server;
  const ids: number[] = [];
  beforeAll(async () => {
    const configured = process.env.TEST_DATABASE_URL;
    const target = configured && new URL(configured);
    if (
      !target ||
      !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) ||
      !target.pathname.endsWith('_test')
    ) {
      throw new Error(
        'Set TEST_DATABASE_URL to a dedicated local *_test database',
      );
    }
    process.env.DATABASE_URL = configured;
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ NEXTAUTH_SECRET: 'roles-test-only-secret' })],
        }),
        PrismaModule,
        AuthModule,
        UserModule,
        TrainingModule,
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    db = app.get(PrismaService);
    jwt = app.get(JwtService);
    server = app.getHttpServer();
  });
  afterAll(async () => {
    if (db) await db.user.deleteMany({ where: { id: { in: ids } } });
    await app?.close();
  });
  async function account(role: 'USER' | 'COACH' | 'ADMIN') {
    const user = await db.user.create({
      data: { role, firstName: 'Role fixture' },
    });
    ids.push(user.id);
    return { ...user, token: jwt.sign({ sub: user.id, role }) };
  }

  it('lets an administrator assign and remove coach access, including with the same old token', async () => {
    const admin = await account('ADMIN');
    const student = await account('USER');
    const path = `/api/users/${student.id}/role`;
    await request(server)
      .patch(path)
      .auth(admin.token, { type: 'bearer' })
      .send({ role: 'COACH' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: student.id, role: 'COACH' });
      });
    await request(server)
      .patch(`/api/users/verify-level/${student.id}`)
      .auth(student.token, { type: 'bearer' })
      .send({ isLevelVerified: true })
      .expect(409);
    const coachToken = jwt.sign({ sub: student.id, role: 'COACH' });
    await request(server)
      .patch(path)
      .auth(admin.token, { type: 'bearer' })
      .send({ role: 'USER' })
      .expect(200);
    await request(server)
      .get('/api/users/profile')
      .auth(student.token, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(z.object({ role: z.string() }).parse(body).role).toBe('USER');
      });
    await request(server)
      .patch(`/api/users/verify-level/${student.id}`)
      .auth(student.token, { type: 'bearer' })
      .send({ isLevelVerified: true })
      .expect(403);
    await request(server)
      .patch(`/api/users/verify-level/${student.id}`)
      .auth(coachToken, { type: 'bearer' })
      .send({ isLevelVerified: true })
      .expect(403);
  });

  it('allows only administrators to find accounts for coach management without exposing private fields', async () => {
    const admin = await account('ADMIN');
    const student = await account('USER');
    const coach = await account('COACH');
    const path = `/api/users/role-candidates?q=${student.id}`;
    await request(server).get(path).expect(401);
    for (const viewer of [student, coach]) {
      await request(server)
        .get(path)
        .auth(viewer.token, { type: 'bearer' })
        .expect(403);
    }
    await request(server)
      .get(path)
      .auth(admin.token, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([
          {
            id: student.id,
            firstName: 'Role fixture',
            lastName: null,
            username: null,
            role: 'USER',
          },
        ]);
      });
  });

  it('prohibits self-promotion, changing other users, public ADMIN grants, and modifying an administrator', async () => {
    const admin = await account('ADMIN');
    const student = await account('USER');
    const coach = await account('COACH');
    await request(server)
      .patch(`/api/users/${student.id}/role`)
      .send({ role: 'COACH' })
      .expect(401);
    for (const actor of [student, coach]) {
      for (const target of [actor, student, coach, admin]) {
        await request(server)
          .patch(`/api/users/${target.id}/role`)
          .auth(actor.token, { type: 'bearer' })
          .send({ role: 'COACH' })
          .expect(403);
      }
    }
    for (const body of [
      { role: 'ADMIN' },
      { role: 'USER', balance: 100 },
      {},
      { role: 'unknown' },
    ]) {
      await request(server)
        .patch(`/api/users/${student.id}/role`)
        .auth(admin.token, { type: 'bearer' })
        .send(body)
        .expect(400);
    }
    for (const role of ['COACH', 'USER']) {
      await request(server)
        .patch(`/api/users/${admin.id}/role`)
        .auth(admin.token, { type: 'bearer' })
        .send({ role })
        .expect(409);
    }
    await request(server)
      .patch('/api/users/2147483647/role')
      .auth(admin.token, { type: 'bearer' })
      .send({ role: 'COACH' })
      .expect(404);
    for (const actor of [admin, coach, student]) {
      for (const body of [
        { role: 'ADMIN' },
        { role: 'COACH' },
        { skillLevel: 'ADVANCED' },
        { balance: 100 },
        { isLevelVerified: true },
      ]) {
        await request(server)
          .patch('/api/users/profile')
          .auth(actor.token, { type: 'bearer' })
          .send(body)
          .expect(400);
      }
    }
    await request(server)
      .get('/api/users/profile')
      .auth(student.token, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) =>
        expect(z.object({ role: z.string() }).parse(body).role).toBe('USER'),
      );
  });

  it('bootstraps exactly the configured existing Telegram account, idempotently, and rejects missing/invalid accounts', async () => {
    const owner = await account('USER');
    const other = await account('USER');
    const telegramId = `7${Date.now()}`;
    await db.user.update({ where: { id: owner.id }, data: { telegramId } });
    const run = (configured: string | undefined) =>
      promisify(execFile)(
        process.execPath,
        ['../../scripts/bootstrap-admin.mjs'],
        {
          env: {
            ...process.env,
            DATABASE_URL: process.env.TEST_DATABASE_URL,
            ADMIN_TELEGRAM_ID: configured,
          },
        },
      );
    await run(telegramId);
    await request(server)
      .get('/api/users/profile')
      .auth(owner.token, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) =>
        expect(z.object({ role: z.string() }).parse(body).role).toBe('ADMIN'),
      );
    await run(telegramId);
    await request(server)
      .get('/api/users/profile')
      .auth(other.token, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) =>
        expect(z.object({ role: z.string() }).parse(body).role).toBe('USER'),
      );
    for (const configured of [
      undefined,
      '',
      '0',
      'not-a-telegram-id',
      '999999999999999999999999999',
    ]) {
      await expect(run(configured)).rejects.toThrow();
    }
    await expect(run('777777777777777')).rejects.toThrow();
  });

  it('rejects out-of-range account IDs before accessing PostgreSQL', async () => {
    const admin = await account('ADMIN');
    for (const id of ['0', '-1', 'invalid', '2147483648', '9007199254740991']) {
      await request(server)
        .patch(`/api/users/${id}/role`)
        .auth(admin.token, { type: 'bearer' })
        .send({ role: 'COACH' })
        .expect(400);
    }
  });
});
