import type { Booking } from '@prisma/client';
import { BookingResponseSchema } from '@govolley/shared-types';
const state = BookingResponseSchema.omit({ training: true });

export function bookingState(booking: Booking) {
  return state.parse({
    id: booking.id,
    status: booking.status,
    kind: booking.kind,
    paymentType: booking.paymentType,
    cashPrice: booking.cashPrice,
    cashReceived: booking.cashReceived,
    attendanceStatus: booking.attendanceStatus,
    paymentStatus:
      booking.cashReceived === true
        ? 'PAID'
        : booking.cashReceived === false || booking.kind === 'SINGLE_CASH'
          ? 'UNPAID'
          : 'UNRECORDED',
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    cancellationTiming: booking.cancellationTiming,
    createdAt: booking.createdAt.toISOString(),
  });
}
