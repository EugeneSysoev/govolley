import { z } from 'zod';

/** Owner-only history. Payment status describes recorded evidence, not a debt. */
export const BookingResponseSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(['CONFIRMED', 'CANCELLED']),
  kind: z.enum(['LEGACY', 'SINGLE_CASH']),
  paymentType: z.string(),
  cashPrice: z.number().int().nullable(),
  paymentStatus: z.enum(['UNRECORDED', 'UNPAID']),
  cancelledAt: z.iso.datetime().nullable(),
  cancellationTiming: z.enum(['TIMELY', 'LATE']).nullable(),
  createdAt: z.iso.datetime(),
  training: z.object({
    id: z.number().int().positive(), title: z.string(), date: z.iso.datetime(),
    startTime: z.string(), endTime: z.string(), location: z.string().nullable(),
    isActive: z.boolean(),
  }),
});
export type Booking = z.infer<typeof BookingResponseSchema>;
