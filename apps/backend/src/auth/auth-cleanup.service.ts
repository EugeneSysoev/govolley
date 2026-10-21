import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthSessionService } from './auth-session.service.js';
@Injectable()
export class AuthCleanupService {
  private readonly logger = new Logger(AuthCleanupService.name);
  constructor(private readonly sessions: AuthSessionService) {}
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron(): Promise<void> {
    try {
      await this.sessions.cleanup();
    } catch {
      this.logger.error('Не удалось очистить auth-сессии');
    }
  }
}
