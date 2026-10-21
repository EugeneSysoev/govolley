import { Injectable } from '@nestjs/common';
import type { Prisma, Training, NotificationKind } from '@prisma/client';
import { schoolDateKey } from '@govolley/shared-types';
import type { NotificationList } from '@govolley/shared-types';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Call inside the booking transition transaction, never from the delivery worker. */
  async recordBooking(
    tx: Prisma.TransactionClient,
    event: {
      bookingId: number;
      userId: number;
      training: Training;
      kind: NotificationKind;
    },
  ): Promise<void> {
    const recipient = (
      await tx.user.findUniqueOrThrow({
        where: { id: event.userId },
        select: { telegramId: true },
      })
    ).telegramId;
    const schoolDate = schoolDateKey(event.training.date);
    const result =
      event.kind === 'BOOKING_CONFIRMED'
        ? 'Запись подтверждена.'
        : 'Ваша запись отменена.';
    const title = event.training.title.slice(0, 3000);
    const date = schoolDate.split('-').reverse().join('.');
    await tx.notification.create({
      data: {
        bookingId: event.bookingId,
        userId: event.userId,
        trainingId: event.training.id,
        kind: event.kind,
        recipient,
        trainingTitle: event.training.title,
        schoolDate,
        startTime: event.training.startTime,
        endTime: event.training.endTime,
        text: `${result}\n${title}\n${date}, ${event.training.startTime}–${event.training.endTime} — время Пхукета (Asia/Bangkok).`,
        status: recipient ? 'PENDING' : 'UNDELIVERABLE',
        lastError: recipient ? null : 'NO_RECIPIENT',
      },
    });
  }

  async list(
    undelivered: boolean,
    beforeId?: number,
  ): Promise<NotificationList> {
    const rows = await this.prisma.notification.findMany({
      where: {
        ...(undelivered ? { status: { not: 'DELIVERED' } } : {}),
        ...(beforeId ? { id: { lt: beforeId } } : {}),
      },
      orderBy: { id: 'desc' },
      take: 51,
      select: {
        id: true,
        bookingId: true,
        userId: true,
        trainingId: true,
        kind: true,
        trainingTitle: true,
        schoolDate: true,
        startTime: true,
        endTime: true,
        text: true,
        status: true,
        attempts: true,
        nextAttemptAt: true,
        deliveredAt: true,
        lastError: true,
        createdAt: true,
      },
    });
    const page = rows.slice(0, 50);
    return {
      items: page.map((row) => ({
        ...row,
        nextAttemptAt: row.nextAttemptAt.toISOString(),
        deliveredAt: row.deliveredAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
        lastError:
          row.lastError as NotificationList['items'][number]['lastError'],
      })),
      nextCursor: rows.length > 50 ? page[page.length - 1].id : null,
    };
  }
}
