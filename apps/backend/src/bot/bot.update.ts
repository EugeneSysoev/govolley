import { Update, Start, Ctx } from 'nestjs-telegraf';
import { Context, TelegramError } from 'telegraf';
import { Logger } from '@nestjs/common';
import { z } from 'zod';
import { AuthSessionService } from '../auth/auth-session.service.js';
interface StartContext extends Context {
  startPayload?: string;
}
@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);
  constructor(private readonly sessions: AuthSessionService) {}
  private async safeReply(ctx: Context, text: string) {
    try {
      await ctx.reply(text);
    } catch (error: unknown) {
      if (!(error instanceof TelegramError && error.code === 403))
        this.logger.warn('Telegram reply failed');
    }
  }
  @Start()
  async onStart(@Ctx() ctx: StartContext): Promise<void> {
    if (!ctx.from) return;
    if (!ctx.startPayload) {
      await this.safeReply(
        ctx,
        'Для входа нажмите кнопку авторизации на сайте GoVolley.',
      );
      return;
    }
    if (!z.uuid().safeParse(ctx.startPayload).success) {
      await this.safeReply(ctx, 'Ссылка недействительна. Начните вход заново.');
      return;
    }
    try {
      await this.sessions.confirm(ctx.startPayload, ctx.from);
      await this.safeReply(ctx, 'Вход подтвержден! Вернитесь на сайт.');
    } catch {
      this.logger.warn('Auth confirmation failed');
      await this.safeReply(
        ctx,
        'Сессия недоступна. Начните вход заново на сайте.',
      );
    }
  }
}
