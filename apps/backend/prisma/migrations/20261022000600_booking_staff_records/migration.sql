CREATE TYPE "AttendanceStatus" AS ENUM ('UNMARKED', 'ATTENDED', 'NO_SHOW');
CREATE TYPE "BookingAuditField" AS ENUM ('ATTENDANCE', 'CASH_PAYMENT');
ALTER TABLE "Booking"
  ADD COLUMN "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'UNMARKED',
  ADD COLUMN "cashReceived" BOOLEAN;

CREATE TABLE "BookingAudit" (
  "id" SERIAL PRIMARY KEY,
  "bookingId" INTEGER NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
  "actorId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "requestId" UUID NOT NULL,
  "field" "BookingAuditField" NOT NULL,
  "oldValue" TEXT NOT NULL,
  "newValue" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "BookingAudit_actorId_requestId_key" ON "BookingAudit"("actorId", "requestId");
CREATE INDEX "BookingAudit_bookingId_id_idx" ON "BookingAudit"("bookingId", "id");
