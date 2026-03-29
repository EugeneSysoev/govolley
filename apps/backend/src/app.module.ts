import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TrainingModule } from './training/training.module.js';
import { AuthController } from './auth/auth.controller.js';
import { BotUpdate } from './bot/bot.update.js';
import { UserController } from './user/user.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TrainingModule,
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
  providers: [AppService, BotUpdate],
})
export class AppModule {}
