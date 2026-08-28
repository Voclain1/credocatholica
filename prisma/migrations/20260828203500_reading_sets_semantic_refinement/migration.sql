-- CreateEnum
CREATE TYPE "ReadingSetContext" AS ENUM ('WEEKDAY', 'SUNDAY', 'PROPER_OF_SAINTS', 'PROPER_OF_SEASON', 'COMMON_OF_SAINTS');

-- CreateEnum
CREATE TYPE "ReadingSetSelectionStatus" AS ENUM ('SOLE_SET', 'ALTERNATIVE', 'OPTIONAL');

-- AlterTable ReadingSet: Drop setType and isDefault; add context, selectionStatus, isCanonicalDefault
ALTER TABLE "ReadingSet" DROP COLUMN "setType";
ALTER TABLE "ReadingSet" DROP COLUMN "isDefault";
ALTER TABLE "ReadingSet" ADD COLUMN "context" "ReadingSetContext" NOT NULL;
ALTER TABLE "ReadingSet" ADD COLUMN "selectionStatus" "ReadingSetSelectionStatus" NOT NULL DEFAULT 'SOLE_SET';
ALTER TABLE "ReadingSet" ADD COLUMN "isCanonicalDefault" BOOLEAN;

-- AlterTable Reading: Drop optionGroup
ALTER TABLE "Reading" DROP COLUMN IF EXISTS "optionGroup";

-- DropEnum
DROP TYPE IF EXISTS "ReadingSetType";
