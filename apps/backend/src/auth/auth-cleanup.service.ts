import { Injectable, Logger } from '@nestjs/common';
// Импортируем всё пространство имен, чтобы избежать проблем с разрешением типов декораторов
import * as NestSchedule from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '@prisma/client';

@Injectable()
export class AuthCleanupService {
  private readonly logger = new Logger(AuthCleanupService.name);
  private readonly SESSION_TTL_MS = 10 * 60 * 1000; // 10 минут

  constructor(private readonly prisma: PrismaService) {}

  // Используем полное имя пространства имен.
  // Это гарантирует, что TS увидит тип декоратора и константы.
  @NestSchedule.Cron(NestSchedule.CronExpression.EVERY_HOUR)
  async handleCron(): Promise<void> {
    const expirationThreshold = new Date(Date.now() - this.SESSION_TTL_MS);

    try {
      // Явно указываем тип BatchPayload, чтобы убрать ошибку unsafe member access на .count
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
        this.logger.log(
          `[Cleanup] Удалено просроченных сессий: ${result.count}`,
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[Cleanup] Ошибка при очистке: ${errorMessage}`);
    }
  }
}
