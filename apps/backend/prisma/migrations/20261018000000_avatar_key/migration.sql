-- Legacy image paths remain untrusted and are never promoted into deletion keys.
ALTER TABLE "User" ADD COLUMN "avatarKey" TEXT;
