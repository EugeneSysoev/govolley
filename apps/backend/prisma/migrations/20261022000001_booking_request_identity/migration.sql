ALTER TABLE "Booking" ADD COLUMN "requestId" UUID;
CREATE UNIQUE INDEX "Booking_userId_requestId_key" ON "Booking"("userId", "requestId");

ALTER TABLE "Booking" DROP CONSTRAINT "Booking_cash_terms_check";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_cash_terms_check"
  CHECK (("kind" = 'LEGACY' AND "cashPrice" IS NULL)
    OR ("kind" = 'SINGLE_CASH' AND "paymentType" = 'CASH' AND "cashPrice" IS NOT NULL AND "cashPrice" = 500));
