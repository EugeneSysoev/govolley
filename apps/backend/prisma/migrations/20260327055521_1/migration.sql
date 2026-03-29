/*
  Warnings:

  - A unique constraint covering the columns `[telegramId]` on the table `AuthSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_telegramId_key" ON "AuthSession"("telegramId");
