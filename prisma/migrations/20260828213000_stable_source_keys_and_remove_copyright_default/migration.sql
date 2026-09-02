-- Remove copyrightInfo default from Reading table
ALTER TABLE "Reading" ALTER COLUMN "copyrightInfo" DROP DEFAULT;

-- Add sourceKey to ReadingSet table
ALTER TABLE "ReadingSet" ADD COLUMN "sourceKey" TEXT;

-- Populate existing ReadingSet sourceKey values using context
UPDATE "ReadingSet" SET "sourceKey" = "context"::text WHERE "sourceKey" IS NULL;

-- Make ReadingSet.sourceKey NOT NULL
ALTER TABLE "ReadingSet" ALTER COLUMN "sourceKey" SET NOT NULL;

-- Redefine ReadingSet unique index: replace setOrder with sourceKey
DROP INDEX IF EXISTS "ReadingSet_liturgicalDayId_setOrder_key";
CREATE UNIQUE INDEX "ReadingSet_liturgicalDayId_sourceKey_key" ON "ReadingSet"("liturgicalDayId", "sourceKey");
CREATE INDEX "ReadingSet_liturgicalDayId_setOrder_idx" ON "ReadingSet"("liturgicalDayId", "setOrder");

-- Add sourceKey to Reading table
ALTER TABLE "Reading" ADD COLUMN "sourceKey" TEXT;

-- Populate existing Reading sourceKey values using type
UPDATE "Reading" SET "sourceKey" = "type"::text WHERE "sourceKey" IS NULL;

-- Make Reading.sourceKey NOT NULL
ALTER TABLE "Reading" ALTER COLUMN "sourceKey" SET NOT NULL;

-- Redefine Reading unique index: replace readingOrder with sourceKey
DROP INDEX IF EXISTS "Reading_readingSetId_readingOrder_key";
CREATE UNIQUE INDEX "Reading_readingSetId_sourceKey_key" ON "Reading"("readingSetId", "sourceKey");
CREATE INDEX "Reading_readingSetId_readingOrder_idx" ON "Reading"("readingSetId", "readingOrder");
