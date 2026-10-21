import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { z } from 'zod';
import { AuthSessionService } from './auth-session.service.js';
import { validate } from '../common/utils/validate.js';
const sessionId = z.uuid();
@Controller('bot-auth')
export class AuthController {
  constructor(private readonly sessions: AuthSessionService) {}
  @Post('init-session')
  initSession() {
    return this.sessions.create();
  }
  @Get('session-status/:id')
  checkSessionStatus(@Param('id') id: string) {
    return this.sessions.status(validate(sessionId, id));
  }
  @Post('verify-confirmed-session')
  verifyConfirmed(@Body() body: unknown) {
    const data = validate(z.strictObject({ sessionId }), body);
    return this.sessions.exchange(data.sessionId);
  }
}
