import { Update, Start, Ctx } from 'nestjs-telegraf';
import { Context, Markup, TelegramError } from 'telegraf'; // Добавили TelegramError
import { PrismaService } from '../prisma/prisma.service.js';
import { Logger } from '@nestjs/common';

// Удалили InlineKeyboardButton, так как используем Markup.button.url()

interface StartContext extends Context {
  startPayload?: string;
}

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Безопасная отправка сообщения с обработкой ошибок Telegram
   */
  private async safeReply(
    ctx: Context,
    text: string,
    extra?: object, // Заменили any на object для соответствия типам Telegraf
  ) {
    try {
      return await ctx.reply(text, extra);
    } catch (error: unknown) {
      // Проверяем, является ли ошибка ошибкой Telegram
      if (error instanceof TelegramError && error.code === 403) {
        this.logger.warn(`User ${ctx.from?.id} blocked the bot.`);
        return null;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send message: ${message}`);
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

      await this.safeReply(
        ctx,
        '✅ Вход подтвержден!',
        Markup.inlineKeyboard([
          [
            Markup.button.url(
              '🔙 Вернуться на сайт',
              'https://spathose-julie-unbreakable.ngrok-free.dev/profile',
            ),
          ],
        ]),
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Auth Process Error: ${message}`);

      // Пытаемся ответить пользователю, если это не ошибка блокировки
      await this.safeReply(
        ctx,
        '⚠️ Ошибка при обработке входа. Попробуйте еще раз с сайта.',
      );
    }
  }
}
