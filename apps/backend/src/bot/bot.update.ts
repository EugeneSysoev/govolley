import { Update, Start, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service.js';

@Update()
export class BotUpdate {
  constructor(private readonly prisma: PrismaService) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    const tgUser = ctx.from;

    // 1. Безопасно извлекаем текст сообщения.
    // Используем проверку 'text' in message, чтобы линтер понимал тип.
    let messageText = '';
    if (ctx.message && 'text' in ctx.message) {
      messageText = ctx.message.text;
    }

    // 2. Достаем sessionId.
    // Чтобы линтер не ругался на startPayload, обращаемся через ['prop']
    const startPayload = (ctx as Record<string, any>)['startPayload'] as
      | string
      | undefined;
    const sessionId = startPayload || messageText.split(' ')[1];

    if (!sessionId || !tgUser) {
      await ctx.reply(
        'Привет! Чтобы войти на платформу GoVolley, нажмите кнопку авторизации на самом сайте. 🏐',
      );
      return;
    }

    try {
      // 3. Проверка сессии
      const session = await this.prisma.authSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        await ctx.reply(
          '❌ Ссылка устарела или неверна. Попробуйте еще раз на сайте.',
        );
        return;
      }

      // 4. Upsert пользователя
      const user = await this.prisma.user.upsert({
        where: { telegramId: tgUser.id.toString() },
        update: {
          username: tgUser.username || null,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name || null,
        },
        create: {
          telegramId: tgUser.id.toString(),
          username: tgUser.username || null,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name || null,
          role: 'USER',
          balance: 0,
        },
      });

      // 5. Подтверждение сессии
      await this.prisma.authSession.update({
        where: { id: sessionId },
        data: {
          status: 'CONFIRMED',
          userId: user.id,
          telegramId: tgUser.id.toString(),
        },
      });

      await ctx.reply(
        `✅ Рады видеть тебя, ${tgUser.first_name}! Вход на сайт GoVolley подтвержден.`,
      );
    } catch (error) {
      console.error('Bot Auth Error:', error);
      await ctx.reply('⚠️ Произошла ошибка при авторизации.');
    }
  }
}
