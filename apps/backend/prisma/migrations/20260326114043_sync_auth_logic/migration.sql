-- AlterTable
ALTER TABLE "AuthSession" ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE INDEX "AuthSession_status_idx" ON "AuthSession"("status");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
