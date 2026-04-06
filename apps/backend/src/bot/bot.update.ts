import { Update, Start, Ctx } from 'nestjs-telegraf';
import { Context, TelegramError } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service.js';
import { Logger } from '@nestjs/common';

interface StartContext extends Context {
  startPayload?: string;
}

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(private readonly prisma: PrismaService) {}

  // Безопасная отправка сообщения с обработкой ошибок
  private async safeReply(ctx: Context, text: string, extra?: object) {
    try {
      return await ctx.reply(text, extra);
    } catch (error: unknown) {
      if (error instanceof TelegramError && error.code === 403) {
        this.logger.warn(`Пользователь ${ctx.from?.id} заблокировал бота`);
        return null;
      }

      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.logger.error(`Ошибка отправки: ${message}`);
      throw error;
    }
  }

  @Start()
  async onStart(@Ctx() ctx: StartContext): Promise<void> {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const sessionId = ctx.startPayload;

    if (!sessionId) {
      await this.safeReply(
        ctx,
        '👋 Привет! Чтобы войти на платформу GoVolley, нажмите кнопку авторизации на сайте.',
      );
      return;
    }

    try {
      const session = await this.prisma.authSession.findUnique({
        where: { id: sessionId },
      });

      if (!session || session.status !== 'PENDING') {
        await this.safeReply(ctx, '❌ Сессия не найдена или уже подтверждена.');
        return;
      }

      // Создаем или обновляем пользователя и подтверждаем сессию
      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
          where: { telegramId: tgUser.id.toString() },
          update: {
            username: tgUser.username ?? null,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name ?? null,
          },
          create: {
            telegramId: tgUser.id.toString(),
            username: tgUser.username ?? null,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name ?? null,
            role: 'USER',
            balance: 0,
          },
        });

        await tx.authSession.update({
          where: { id: sessionId },
          data: {
            status: 'CONFIRMED',
            userId: user.id,
            telegramId: tgUser.id.toString(),
          },
        });
      });

      await this.safeReply(ctx, '✅ Вход подтвержден! Вернитесь на сайт.');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.logger.error(`Ошибка авторизации: ${message}`);

      await this.safeReply(ctx, '⚠️ Ошибка входа. Попробуйте еще раз.');
    }
  }
}
