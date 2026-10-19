import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { AuthController } from '../src/auth/auth.controller.js';
import { AuthSessionService } from '../src/auth/auth-session.service.js';
describe('auth HTTP smoke (external dependencies replaced)', () => {
  let app: INestApplication<Server>;
  const sessions = {
    create: jest.fn().mockResolvedValue({ sessionId: 'fixture' }),
    status: jest.fn().mockResolvedValue({ status: 'pending' }),
    exchange: jest.fn(),
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthSessionService, useValue: sessions }],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  it('initializes the current auth protocol', async () => {
    await request(app.getHttpServer())
      .post('/api/bot-auth/init-session')
      .expect(201)
      .expect({ sessionId: 'fixture' });
  });
  it('rejects malformed session IDs before reaching the service', async () => {
    await request(app.getHttpServer())
      .post('/api/bot-auth/verify-confirmed-session')
      .send({ sessionId: '../../invalid' })
      .expect(400);
    expect(sessions.exchange).not.toHaveBeenCalled();
  });
});
