import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '@prisma/client';

@Injectable()
export class AuthCleanupService {
  private readonly logger = new Logger(AuthCleanupService.name);
  private readonly SESSION_TTL_MS = 60 * 60 * 1000; // 60 минут

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron(): Promise<void> {
    const expirationThreshold = new Date(Date.now() - this.SESSION_TTL_MS);

    try {
      const result: Prisma.BatchPayload =
        await this.prisma.authSession.deleteMany({
          where: {
            status: 'PENDING',
            createdAt: {
              lt: expirationThreshold,
            },
          },
        });

      if (result.count > 0) {
        this.logger.log(`Удалено просроченных сессий: ${result.count}`);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Ошибка при очистке сессий: ${errorMessage}`);
    }
  }
}
