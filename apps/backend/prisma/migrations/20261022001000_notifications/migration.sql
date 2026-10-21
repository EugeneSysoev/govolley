CREATE TYPE "NotificationKind" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_CANCELLED');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'RETRY', 'DELIVERED', 'UNDELIVERABLE');
CREATE TABLE "Notification" (
  "id" SERIAL PRIMARY KEY,
  "bookingId" INTEGER NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "trainingId" INTEGER NOT NULL,
  "kind" "NotificationKind" NOT NULL,
  "recipient" TEXT,
  "trainingTitle" TEXT NOT NULL,
  "schoolDate" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leaseUntil" TIMESTAMP(3),
  "leaseToken" UUID,
  "deliveredAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Notification_bookingId_kind_key" ON "Notification"("bookingId", "kind");
CREATE INDEX "Notification_status_nextAttemptAt_leaseUntil_idx" ON "Notification"("status", "nextAttemptAt", "leaseUntil");
-- No historical intents are inferred from legacy bookings.
