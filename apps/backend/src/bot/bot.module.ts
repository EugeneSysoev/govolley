import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module.js';
import { BotUpdate } from './bot.update.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import {
  NotificationDeliveryDriver,
  NotificationClock,
} from '../notifications/notification-delivery.js';
import { NOTIFICATION_TRANSPORT } from '../notifications/notification-transport.js';
import { TelegramNotificationTransport } from './telegram-notification.transport.js';
import { NotificationTicker } from './notification-ticker.js';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.getOrThrow('TELEGRAM_BOT_TOKEN'),
      }),
    }),
  ],
  providers: [
    BotUpdate,
    NotificationDeliveryDriver,
    NotificationClock,
    NotificationTicker,
    {
      provide: NOTIFICATION_TRANSPORT,
      useClass: TelegramNotificationTransport,
    },
  ],
})
export class BotModule {}
