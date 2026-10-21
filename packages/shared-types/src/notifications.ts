import { z } from 'zod';

/** Staff-only delivery view. Telegram identifiers and credentials are never exposed. */
export const NotificationSchema = z.object({
  id: z.number().int().positive(),
  bookingId: z.number().int().positive(),
  userId: z.number().int().positive(),
  trainingId: z.number().int().positive(),
  kind: z.enum(['BOOKING_CONFIRMED', 'BOOKING_CANCELLED']),
  trainingTitle: z.string(), schoolDate: z.string(), startTime: z.string(), endTime: z.string(),
  text: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'RETRY', 'DELIVERED', 'UNDELIVERABLE']),
  attempts: z.number().int().nonnegative(),
  nextAttemptAt: z.iso.datetime(),
  deliveredAt: z.iso.datetime().nullable(),
  lastError: z.enum(['NO_RECIPIENT', 'TELEGRAM_UNAVAILABLE', 'RATE_LIMITED', 'TIMEOUT']).nullable(),
  createdAt: z.iso.datetime(),
});
export const NotificationListSchema = z.object({
  items: z.array(NotificationSchema), nextCursor: z.number().int().positive().nullable(),
});
export type NotificationList = z.infer<typeof NotificationListSchema>;
