import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // 1. Добавлен импорт планировщика
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TrainingModule } from './training/training.module.js';
import { AuthController } from './auth/auth.controller.js';
import { BotUpdate } from './bot/bot.update.js';
import { UserController } from './user/user.controller.js';
import { AuthCleanupService } from './auth/auth-cleanup.service.js'; // 2. Импорт сервиса очистки

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TrainingModule,
    // 3. Активация планировщика (движка для @Cron)
    ScheduleModule.forRoot(),

    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');

        console.log('--- ПРОВЕРКА ИНИЦИАЛИЗАЦИИ БОТА ---');
        console.log(
          'Токен найден:',
          token
            ? 'ДА (начинается на ' + token.substring(0, 5) + ')'
            : 'НЕТ (UNDEFINED)',
        );

        return {
          token: configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, AuthController, UserController],
  providers: [
    AppService,
    BotUpdate,
    AuthCleanupService, // 4. Регистрация провайдера очистки сессий
  ],
})
export class AppModule {}
