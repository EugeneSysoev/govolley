import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { publicProfile } from '../user/public-profile.js';
export const AUTH_SESSION_TTL_MS = 10 * 60 * 1000;
interface TelegramIdentity {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
}
@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}
  private cutoff() {
    return new Date(Date.now() - AUTH_SESSION_TTL_MS);
  }
  async create() {
    const session = await this.prisma.authSession.create({
      data: { id: randomUUID() },
    });
    return {
      sessionId: session.id,
      expiresAt: new Date(
        session.createdAt.getTime() + AUTH_SESSION_TTL_MS,
      ).toISOString(),
      botUrl: `https://t.me/govolley_auth_bot?start=${session.id}`,
    };
  }
  async status(id: string) {
    const session = await this.prisma.authSession.findUnique({ where: { id } });
    if (!session || session.createdAt <= this.cutoff())
      return { status: 'expired' };
    return { status: session.status.toLowerCase() };
  }
  async confirm(id: string, identity: TelegramIdentity): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Claim before user changes. Concurrent/replayed confirmations cannot change identity.
      const claimed = await tx.authSession.updateMany({
        where: { id, status: 'PENDING', createdAt: { gt: this.cutoff() } },
        data: { status: 'CONFIRMED' },
      });
      if (claimed.count !== 1)
        throw new UnauthorizedException(
          'Сессия недоступна. Начните вход заново',
        );
      const profile = {
        username: identity.username ?? null,
        firstName: identity.first_name,
        lastName: identity.last_name ?? null,
      };
      const user = await tx.user.upsert({
        where: { telegramId: String(identity.id) },
        update: profile,
        create: { ...profile, telegramId: String(identity.id) },
      });
      await tx.authSession.update({
        where: { id },
        data: { userId: user.id, telegramId: String(identity.id) },
      });
    });
  }
  async exchange(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.authSession.updateMany({
        where: {
          id,
          status: 'CONFIRMED',
          userId: { not: null },
          createdAt: { gt: this.cutoff() },
        },
        data: { status: 'CONSUMED' },
      });
      if (claimed.count !== 1)
        throw new UnauthorizedException(
          'Сессия недоступна. Начните вход заново',
        );
      const session = await tx.authSession.findUniqueOrThrow({
        where: { id },
        include: { user: true },
      });
      if (!session.user)
        throw new UnauthorizedException('Пользователь не найден');
      // Signing failure rolls back consumption. Lost HTTP response requires a new login.
      const accessToken = await this.jwt.signAsync({
        sub: session.user.id,
        role: session.user.role,
      });
      return { ...publicProfile(session.user), accessToken };
    });
  }
  cleanup() {
    return this.prisma.authSession.deleteMany({
      where: { createdAt: { lte: this.cutoff() } },
    });
  }
}
