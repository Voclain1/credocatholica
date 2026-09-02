-- DropIndex
DROP INDEX IF EXISTS "ReadingSet_liturgicalDayId_setOrder_idx";

-- DropIndex
DROP INDEX IF EXISTS "Reading_readingSetId_readingOrder_idx";

-- AlterTable
ALTER TABLE "Reading" ALTER COLUMN "copyrightInfo" SET DEFAULT 'Douay-Rheims Version, Challoner Revision. Source text: Project Gutenberg eBook #1581. Project Gutenberg identifies this text as public domain in the USA; reuse outside the USA is subject to applicable local law.';

-- CreateIndex
CREATE UNIQUE INDEX "ReadingSet_liturgicalDayId_setOrder_key" ON "ReadingSet"("liturgicalDayId", "setOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Reading_readingSetId_readingOrder_key" ON "Reading"("readingSetId", "readingOrder");
