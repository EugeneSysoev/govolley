import { Inject, Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import type { Notification } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  NOTIFICATION_TRANSPORT,
  NotificationTransportError,
} from './notification-transport.js';
import type { NotificationTransport } from './notification-transport.js';

@Injectable()
export class NotificationClock {
  now(): number {
    return Date.now();
  }
}

/** Durable queue driver. Only the live BotModule schedules it; HTTP never sends. */
@Injectable()
export class NotificationDeliveryDriver implements OnModuleDestroy {
  private active?: Promise<void>;
  private stopped = false;
  private controller?: AbortController;
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_TRANSPORT)
    private readonly transport: NotificationTransport,
    private readonly clock: NotificationClock,
  ) {}

  dispatchDue(): Promise<void> {
    if (this.stopped) return Promise.resolve();
    if (this.active) return this.active;
    this.active = this.dispatchBatch().finally(() => {
      this.active = undefined;
    });
    return this.active;
  }
  async onModuleDestroy(): Promise<void> {
    this.stopped = true;
    this.controller?.abort();
    await this.active;
  }
  private async dispatchBatch(): Promise<void> {
    for (let count = 0; count < 10 && !this.stopped; count++) {
      const now = new Date(this.clock.now());
      const token = randomUUID();
      const lease = new Date(now.getTime() + 60_000);
      // One statement claims one item. No network I/O is inside a DB transaction.
      const rows = await this.prisma.$queryRaw<Notification[]>`
        WITH due AS (
          SELECT id FROM "Notification"
          WHERE ((status IN ('PENDING', 'RETRY') AND "nextAttemptAt" <= ${now})
            OR (status = 'PROCESSING' AND "leaseUntil" <= ${now}))
          ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1
        )
        UPDATE "Notification" n SET status = 'PROCESSING', attempts = attempts + 1,
          "leaseUntil" = ${lease}, "leaseToken" = ${token}::uuid
        FROM due WHERE n.id = due.id RETURNING n.*`;
      const row = rows[0];
      if (!row) return;
      if (!row.recipient) {
        await this.prisma.notification.updateMany({
          where: { id: row.id, leaseToken: token },
          data: {
            status: 'UNDELIVERABLE',
            lastError: 'NO_RECIPIENT',
            leaseUntil: null,
            leaseToken: null,
          },
        });
        continue;
      }
      const controller = new AbortController();
      this.controller = controller;
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const aborted = new Promise<never>((_, reject) =>
          controller.signal.addEventListener(
            'abort',
            () => reject(new NotificationTransportError('TIMEOUT')),
            { once: true },
          ),
        );
        await Promise.race([
          this.transport.send({
            recipient: row.recipient,
            text: row.text,
            signal: controller.signal,
          }),
          aborted,
        ]);
        await this.prisma.notification.updateMany({
          where: { id: row.id, leaseToken: token },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date(this.clock.now()),
            lastError: null,
            leaseUntil: null,
            leaseToken: null,
          },
        });
      } catch (error: unknown) {
        const category =
          error instanceof NotificationTransportError
            ? error.category
            : 'TELEGRAM_UNAVAILABLE';
        const requestedDelay =
          error instanceof NotificationTransportError ? error.retryAfterMs : 0;
        const backoff = Math.min(
          3_600_000,
          30_000 * 2 ** Math.min(row.attempts - 1, 7),
        );
        const delay = Math.max(
          backoff,
          Number.isFinite(requestedDelay)
            ? Math.min(requestedDelay, 86_400_000)
            : 0,
        );
        await this.prisma.notification.updateMany({
          where: { id: row.id, leaseToken: token },
          data: {
            status: 'RETRY',
            nextAttemptAt: new Date(this.clock.now() + delay),
            lastError: category,
            leaseUntil: null,
            leaseToken: null,
          },
        });
      } finally {
        clearTimeout(timeout);
        this.controller = undefined;
      }
    }
  }
}
