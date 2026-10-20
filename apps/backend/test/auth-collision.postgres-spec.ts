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
import { AuthSessionService } from '../src/auth/auth-session.service.js';
import { UserModule } from '../src/user/user.module.js';
import { z } from 'zod';

describe('Telegram username collisions through the real HTTP login protocol', () => {
  let app: INestApplication<Server>;
  let db: PrismaService;
  let sessions: AuthSessionService;
  let jwt: JwtService;
  let server: Server;
  const users: number[] = [];
  const sessionIds: string[] = [];

  beforeAll(async () => {
    const configured = process.env.TEST_DATABASE_URL;
    const target = configured && new URL(configured);
    if (
      !target ||
      !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) ||
      !target.pathname.endsWith('_test')
    ) {
      throw new Error('Use a dedicated local *_test database');
    }
    process.env.DATABASE_URL = configured;
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ NEXTAUTH_SECRET: 'auth-collision-test-only' })],
        }),
        PrismaModule,
        AuthModule,
        UserModule,
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    server = app.getHttpServer();
    db = app.get(PrismaService);
    sessions = app.get(AuthSessionService);
    jwt = app.get(JwtService);
  });
  afterAll(async () => {
    if (db) {
      await db.authSession.deleteMany({ where: { id: { in: sessionIds } } });
      await db.user.deleteMany({ where: { id: { in: users } } });
    }
    await app?.close();
  });
  async function start() {
    const response = await request(server)
      .post('/api/bot-auth/init-session')
      .expect(201);
    const id = z.object({ sessionId: z.uuid() }).parse(response.body).sessionId;
    sessionIds.push(id);
    await request(server)
      .get(`/api/bot-auth/session-status/${id}`)
      .expect(200, { status: 'pending' });
    return id;
  }
  const loginProfile = z.object({
    id: z.number(),
    accessToken: z.string(),
    skillLevel: z.string(),
    isLevelVerified: z.boolean(),
  });

  it('allows a new Telegram owner to log in after someone reserves their username by editing a profile', async () => {
    const reserved = `reserved_${randomUUID().replaceAll('-', '').slice(0, 16)}`;
    const other = await db.user.create({ data: { firstName: 'Other person' } });
    users.push(other.id);
    await request(server)
      .patch('/api/users/profile')
      .auth(jwt.sign({ sub: other.id }), { type: 'bearer' })
      .send({ username: reserved })
      .expect(200);
    const id = await start();
    const identity = {
      id: Date.now(),
      username: reserved,
      first_name: 'Telegram owner',
    };
    // Only the external Telegram confirmation is a fixture; session creation,
    // polling, one-shot exchange, authentication and profile reads are real HTTP.
    try {
      await sessions.confirm(id, identity);
    } finally {
      const created = await db.user.findUnique({
        where: { telegramId: String(identity.id) },
      });
      if (created) users.push(created.id);
    }
    await request(server)
      .get(`/api/bot-auth/session-status/${id}`)
      .expect(200, { status: 'confirmed' });
    const response = await request(server)
      .post('/api/bot-auth/verify-confirmed-session')
      .send({ sessionId: id })
      .expect(201);
    const result = loginProfile.parse(response.body);
    expect(result.id).not.toBe(other.id);
    const own = await request(server)
      .get('/api/users/profile')
      .auth(result.accessToken, { type: 'bearer' })
      .expect(200);
    expect(own.body).toMatchObject({
      id: result.id,
      firstName: 'Telegram owner',
      skillLevel: 'NOT_SET',
    });
    const unchanged = await request(server)
      .get('/api/users/profile')
      .auth(jwt.sign({ sub: other.id }), { type: 'bearer' })
      .expect(200);
    expect(unchanged.body).toMatchObject({
      username: reserved,
      firstName: 'Other person',
    });
    await request(server)
      .post('/api/bot-auth/verify-confirmed-session')
      .send({ sessionId: id })
      .expect(401);
  });

  it('keeps the existing account and level when Telegram transfers a username to that account', async () => {
    const username = `transferred_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
    const previousName = `old_${randomUUID().replaceAll('-', '').slice(0, 16)}`;
    const telegramId = Date.now() + 1;
    const previousOwner = await db.user.create({
      data: {
        telegramId: String(telegramId + 1),
        username,
        skillLevel: 'BEGINNER',
      },
    });
    users.push(previousOwner.id);
    const currentOwner = await db.user.create({
      data: {
        telegramId: String(telegramId),
        username: previousName,
        skillLevel: 'ADVANCED',
        isLevelVerified: true,
      },
    });
    users.push(currentOwner.id);
    const id = await start();
    await sessions.confirm(id, {
      id: telegramId,
      username,
      first_name: 'Current owner',
    });
    await expect(
      sessions.confirm(id, {
        id: telegramId + 1,
        username,
        first_name: 'Replay',
      }),
    ).rejects.toMatchObject({ status: 401 });
    const outcomes = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(server)
          .post('/api/bot-auth/verify-confirmed-session')
          .send({ sessionId: id }),
      ),
    );
    expect(outcomes.filter((response) => response.status === 201)).toHaveLength(
      1,
    );
    expect(outcomes.filter((response) => response.status === 401)).toHaveLength(
      9,
    );
    const issued = outcomes.find((response) => response.status === 201)!;
    const result = loginProfile.parse(issued.body);
    expect(result).toMatchObject({
      id: currentOwner.id,
      skillLevel: 'ADVANCED',
      isLevelVerified: true,
    });
    const own = await request(server)
      .get('/api/users/profile')
      .auth(result.accessToken, { type: 'bearer' })
      .expect(200);
    expect(own.body).toMatchObject({
      id: currentOwner.id,
      username: previousName,
      firstName: 'Current owner',
      skillLevel: 'ADVANCED',
      isLevelVerified: true,
    });
    const other = await request(server)
      .get('/api/users/profile')
      .auth(jwt.sign({ sub: previousOwner.id }), { type: 'bearer' })
      .expect(200);
    expect(other.body).toMatchObject({
      id: previousOwner.id,
      username,
      skillLevel: 'BEGINNER',
    });
  });
});
