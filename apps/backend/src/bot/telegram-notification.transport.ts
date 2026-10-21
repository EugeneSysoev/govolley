import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import type { NotificationTransport } from '../notifications/notification-transport.js';
import { NotificationTransportError } from '../notifications/notification-transport.js';

@Injectable()
export class TelegramNotificationTransport implements NotificationTransport {
  constructor(@InjectBot() private readonly bot: Telegraf) {}
  async send(
    message: Parameters<NotificationTransport['send']>[0],
  ): Promise<void> {
    try {
      await this.bot.telegram.callApi(
        'sendMessage',
        { chat_id: message.recipient, text: message.text },
        { signal: message.signal },
      );
    } catch (error: unknown) {
      if (message.signal.aborted)
        throw new NotificationTransportError('TIMEOUT');
      if (error && typeof error === 'object' && 'response' in error) {
        const response = error.response;
        if (
          response &&
          typeof response === 'object' &&
          'error_code' in response &&
          response.error_code === 429
        ) {
          const parameters =
            'parameters' in response ? response.parameters : null;
          const seconds =
            parameters &&
            typeof parameters === 'object' &&
            'retry_after' in parameters &&
            typeof parameters.retry_after === 'number'
              ? parameters.retry_after
              : 0;
          throw new NotificationTransportError('RATE_LIMITED', seconds * 1000);
        }
      }
      throw new NotificationTransportError('TELEGRAM_UNAVAILABLE');
    }
  }
}
