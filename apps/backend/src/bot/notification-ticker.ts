import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationDeliveryDriver } from '../notifications/notification-delivery.js';

@Injectable()
export class NotificationTicker {
  private readonly logger = new Logger(NotificationTicker.name);
  constructor(private readonly delivery: NotificationDeliveryDriver) {}
  @Cron('*/5 * * * * *', { waitForCompletion: true })
  async tick(): Promise<void> {
    try {
      await this.delivery.dispatchDue();
    } catch {
      this.logger.warn(
        'Notification delivery temporarily unavailable; durable work retained',
      );
    }
  }
}
