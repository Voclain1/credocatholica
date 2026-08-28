-- CreateEnum
CREATE TYPE "ReadingSetType" AS ENUM ('WEEKDAY', 'SUNDAY', 'PROPER_OF_SAINTS', 'PROPER_OF_SEASON', 'COMMON_OF_SAINTS', 'OPTIONAL_ALTERNATIVE');

-- CreateEnum
CREATE TYPE "TextResolutionStatus" AS ENUM ('VERIFIED_EXACT', 'REQUIRES_MANUAL_SEGMENT_REVIEW', 'TEXT_UNAVAILABLE');

-- CreateTable
CREATE TABLE "ReadingSet" (
    "id" TEXT NOT NULL,
    "liturgicalDayId" TEXT NOT NULL,
    "celebrationId" TEXT,
    "setType" "ReadingSetType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "setOrder" INTEGER NOT NULL DEFAULT 1,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "sourceUrl" TEXT NOT NULL,
    "lectionaryNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingSet_pkey" PRIMARY KEY ("id")
);

-- DropForeignKey & DropColumns on Reading if exists
ALTER TABLE "Reading" DROP CONSTRAINT IF EXISTS "Reading_liturgicalDayId_fkey";
ALTER TABLE "Reading" DROP CONSTRAINT IF EXISTS "Reading_celebrationId_fkey";
ALTER TABLE "Reading" DROP COLUMN IF EXISTS "liturgicalDayId";
ALTER TABLE "Reading" DROP COLUMN IF EXISTS "celebrationId";

-- AddColumns on Reading
ALTER TABLE "Reading" ADD COLUMN "readingSetId" TEXT NOT NULL;
ALTER TABLE "Reading" ADD COLUMN "scriptureRef" TEXT;
ALTER TABLE "Reading" ADD COLUMN "textStatus" "TextResolutionStatus" NOT NULL DEFAULT 'VERIFIED_EXACT';
ALTER TABLE "Reading" ADD COLUMN "optionGroup" TEXT;

-- CreateIndex
CREATE INDEX "ReadingSet_liturgicalDayId_setOrder_idx" ON "ReadingSet"("liturgicalDayId", "setOrder");
CREATE INDEX "ReadingSet_celebrationId_idx" ON "ReadingSet"("celebrationId");
CREATE INDEX "Reading_readingSetId_readingOrder_idx" ON "Reading"("readingSetId", "readingOrder");

-- AddForeignKey
ALTER TABLE "ReadingSet" ADD CONSTRAINT "ReadingSet_liturgicalDayId_fkey" FOREIGN KEY ("liturgicalDayId") REFERENCES "LiturgicalDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReadingSet" ADD CONSTRAINT "ReadingSet_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_readingSetId_fkey" FOREIGN KEY ("readingSetId") REFERENCES "ReadingSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
