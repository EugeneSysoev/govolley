/*
  Warnings:

  - The values [LEVEL_C,LEVEL_B,LEVEL_A] on the enum `SkillLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SkillLevel_new" AS ENUM ('NOT_SET', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');
ALTER TABLE "public"."Training" ALTER COLUMN "targetLevel" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "skillLevel" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "skillLevel" TYPE "SkillLevel_new" USING ("skillLevel"::text::"SkillLevel_new");
ALTER TABLE "Training" ALTER COLUMN "targetLevel" TYPE "SkillLevel_new" USING ("targetLevel"::text::"SkillLevel_new");
ALTER TYPE "SkillLevel" RENAME TO "SkillLevel_old";
ALTER TYPE "SkillLevel_new" RENAME TO "SkillLevel";
DROP TYPE "public"."SkillLevel_old";
ALTER TABLE "Training" ALTER COLUMN "targetLevel" SET DEFAULT 'NOT_SET';
ALTER TABLE "User" ALTER COLUMN "skillLevel" SET DEFAULT 'NOT_SET';
COMMIT;

-- DropIndex
DROP INDEX "AuthSession_telegramId_key";
