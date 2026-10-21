CREATE TYPE "BookingKind" AS ENUM ('LEGACY', 'SINGLE_CASH');
CREATE TYPE "CancellationTiming" AS ENUM ('TIMELY', 'LATE');

-- Existing CASH/BALANCE strings are historical claims, never proof of payment.
ALTER TABLE "Booking"
  ADD COLUMN "kind" "BookingKind" NOT NULL DEFAULT 'LEGACY',
  ADD COLUMN "cashPrice" INTEGER,
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "cancellationTiming" "CancellationTiming";

DROP INDEX "Booking_userId_trainingId_key";
CREATE INDEX "Booking_userId_trainingId_idx" ON "Booking"("userId", "trainingId");
CREATE UNIQUE INDEX "Booking_confirmed_user_training_key"
  ON "Booking"("userId", "trainingId") WHERE "status" = 'CONFIRMED';
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_cash_terms_check"
  CHECK (("kind" = 'LEGACY' AND "cashPrice" IS NULL)
    OR ("kind" = 'SINGLE_CASH' AND "paymentType" = 'CASH' AND "cashPrice" = 500));
