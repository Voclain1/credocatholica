-- Update August 29 Weekday ReadingSet sourceKey and lectionaryNumber to reflect Lectionary 430
UPDATE "ReadingSet"
SET "sourceKey" = 'set-0829-weekday-430',
    "lectionaryNumber" = '430'
WHERE "sourceKey" = 'set-0829-weekday-634';
