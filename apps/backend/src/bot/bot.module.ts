import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module.js';
import { BotUpdate } from './bot.update.js';

@Module({
  imports: [
    AuthModule,
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.getOrThrow('TELEGRAM_BOT_TOKEN'),
      }),
    }),
  ],
  providers: [BotUpdate],
})
export class BotModule {}
