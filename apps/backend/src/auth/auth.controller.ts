import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { randomUUID } from 'node:crypto';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('init-session')
  async initSession() {
    const sessionId = randomUUID();
    await this.prisma.authSession.create({
      data: { id: sessionId, status: 'PENDING' },
    });

    return {
      sessionId,
      botUrl: `https://t.me/govolley_auth_bot?start=${sessionId}`,
    };
  }

  @Get('session-status/:id')
  async checkSessionStatus(@Param('id') id: string) {
    const session = await this.prisma.authSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');

    const isExpired =
      Date.now() - new Date(session.createdAt).getTime() > 10 * 60 * 1000;
    if (isExpired && session.status === 'PENDING') return { status: 'expired' };

    return {
      status: session.status.toLowerCase(),
      userId: session.userId ?? null,
    };
  }

  @Post('verify-confirmed-session')
  async verifyConfirmed(@Body() body: { sessionId: string }) {
    const session = await this.prisma.authSession.findUnique({
      where: { id: body.sessionId },
      include: { user: true },
    });

    if (!session || session.status !== 'CONFIRMED' || !session.user) {
      throw new UnauthorizedException('Сессия не подтверждена');
    }

    const { user } = session;

    // ЛОГ ДЛЯ ТЕРМИНАЛА БЭКЕНДА
    console.log(
      `[Auth] Verifying user ${user.id}. SkillLevel in DB: ${user.skillLevel}`,
    );

    return {
      id: user.id,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Player',
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      image: user.image,
      balance: user.balance,
      skillLevel: user.skillLevel || 'NOT_SET', // Гарантируем строку, а не undefined
    };
  }
}
