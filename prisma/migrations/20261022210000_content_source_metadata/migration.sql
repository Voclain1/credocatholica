-- Additive only. Existing text and publication status are preserved.
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'APOSTOLIC_LETTER';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'APOSTOLIC_CONSTITUTION';
ALTER TABLE "CatechismEntry" ADD COLUMN "sourceUrl" TEXT;
