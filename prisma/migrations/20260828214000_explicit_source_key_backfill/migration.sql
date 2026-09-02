-- Update ReadingSet sourceKeys to explicit semantic keys
UPDATE "ReadingSet"
SET "sourceKey" = 'set-0828-proper-430'
FROM "LiturgicalDay" d
WHERE "ReadingSet"."liturgicalDayId" = d.id AND d.date = '2026-08-28' AND "ReadingSet"."context" = 'PROPER_OF_SAINTS';

UPDATE "ReadingSet"
SET "sourceKey" = 'set-0829-proper-634'
FROM "LiturgicalDay" d
WHERE "ReadingSet"."liturgicalDayId" = d.id AND d.date = '2026-08-29' AND "ReadingSet"."context" = 'PROPER_OF_SAINTS';

UPDATE "ReadingSet"
SET "sourceKey" = 'set-0829-weekday-634'
FROM "LiturgicalDay" d
WHERE "ReadingSet"."liturgicalDayId" = d.id AND d.date = '2026-08-29' AND "ReadingSet"."context" = 'WEEKDAY';

UPDATE "ReadingSet"
SET "sourceKey" = 'set-0830-sunday-124'
FROM "LiturgicalDay" d
WHERE "ReadingSet"."liturgicalDayId" = d.id AND d.date = '2026-08-30' AND "ReadingSet"."context" = 'SUNDAY';

UPDATE "ReadingSet"
SET "sourceKey" = 'set-0831-weekday-431'
FROM "LiturgicalDay" d
WHERE "ReadingSet"."liturgicalDayId" = d.id AND d.date = '2026-08-31' AND "ReadingSet"."context" = 'WEEKDAY';

UPDATE "ReadingSet"
SET "sourceKey" = 'set-0901-weekday-432'
FROM "LiturgicalDay" d
WHERE "ReadingSet"."liturgicalDayId" = d.id AND d.date = '2026-09-01' AND "ReadingSet"."context" = 'WEEKDAY';

UPDATE "ReadingSet"
SET "sourceKey" = 'set-0902-weekday-433'
FROM "LiturgicalDay" d
WHERE "ReadingSet"."liturgicalDayId" = d.id AND d.date = '2026-09-02' AND "ReadingSet"."context" = 'WEEKDAY';

UPDATE "ReadingSet"
SET "sourceKey" = 'set-0903-proper-434'
FROM "LiturgicalDay" d
WHERE "ReadingSet"."liturgicalDayId" = d.id AND d.date = '2026-09-03' AND "ReadingSet"."context" = 'PROPER_OF_SAINTS';


-- Update Reading sourceKeys to explicit semantic keys
-- Aug 28
UPDATE "Reading" SET "sourceKey" = 'reading-0828-proper-first-1cor1' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0828-proper-430' AND "Reading"."type" = 'FIRST_READING';
UPDATE "Reading" SET "sourceKey" = 'reading-0828-proper-psalm-33' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0828-proper-430' AND "Reading"."type" = 'RESPONSORIAL_PSALM';
UPDATE "Reading" SET "sourceKey" = 'reading-0828-proper-gospel-matt25' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0828-proper-430' AND "Reading"."type" = 'GOSPEL';

-- Aug 29 Proper
UPDATE "Reading" SET "sourceKey" = 'reading-0829-proper-first-jer1' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0829-proper-634' AND "Reading"."type" = 'FIRST_READING';
UPDATE "Reading" SET "sourceKey" = 'reading-0829-proper-psalm-71' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0829-proper-634' AND "Reading"."type" = 'RESPONSORIAL_PSALM';
UPDATE "Reading" SET "sourceKey" = 'reading-0829-proper-gospel-mark6' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0829-proper-634' AND "Reading"."type" = 'GOSPEL';

-- Aug 29 Weekday
UPDATE "Reading" SET "sourceKey" = 'reading-0829-weekday-first-1cor1' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0829-weekday-634' AND "Reading"."type" = 'FIRST_READING';
UPDATE "Reading" SET "sourceKey" = 'reading-0829-weekday-psalm-33' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0829-weekday-634' AND "Reading"."type" = 'RESPONSORIAL_PSALM';
UPDATE "Reading" SET "sourceKey" = 'reading-0829-weekday-gospel-mark6' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0829-weekday-634' AND "Reading"."type" = 'GOSPEL';

-- Aug 30
UPDATE "Reading" SET "sourceKey" = 'reading-0830-sunday-first-jer20' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0830-sunday-124' AND "Reading"."type" = 'FIRST_READING';
UPDATE "Reading" SET "sourceKey" = 'reading-0830-sunday-psalm-63' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0830-sunday-124' AND "Reading"."type" = 'RESPONSORIAL_PSALM';
UPDATE "Reading" SET "sourceKey" = 'reading-0830-sunday-second-rom12' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0830-sunday-124' AND "Reading"."type" = 'SECOND_READING';
UPDATE "Reading" SET "sourceKey" = 'reading-0830-sunday-gospel-matt16' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0830-sunday-124' AND "Reading"."type" = 'GOSPEL';

-- Aug 31
UPDATE "Reading" SET "sourceKey" = 'reading-0831-weekday-first-1cor2' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0831-weekday-431' AND "Reading"."type" = 'FIRST_READING';
UPDATE "Reading" SET "sourceKey" = 'reading-0831-weekday-psalm-119' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0831-weekday-431' AND "Reading"."type" = 'RESPONSORIAL_PSALM';
UPDATE "Reading" SET "sourceKey" = 'reading-0831-weekday-gospel-luke4' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0831-weekday-431' AND "Reading"."type" = 'GOSPEL';

-- Sep 01
UPDATE "Reading" SET "sourceKey" = 'reading-0901-weekday-first-1cor2' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0901-weekday-432' AND "Reading"."type" = 'FIRST_READING';
UPDATE "Reading" SET "sourceKey" = 'reading-0901-weekday-psalm-145' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0901-weekday-432' AND "Reading"."type" = 'RESPONSORIAL_PSALM';
UPDATE "Reading" SET "sourceKey" = 'reading-0901-weekday-gospel-luke4' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0901-weekday-432' AND "Reading"."type" = 'GOSPEL';

-- Sep 02
UPDATE "Reading" SET "sourceKey" = 'reading-0902-weekday-first-1cor3' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0902-weekday-433' AND "Reading"."type" = 'FIRST_READING';
UPDATE "Reading" SET "sourceKey" = 'reading-0902-weekday-psalm-33' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0902-weekday-433' AND "Reading"."type" = 'RESPONSORIAL_PSALM';
UPDATE "Reading" SET "sourceKey" = 'reading-0902-weekday-gospel-luke4' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0902-weekday-433' AND "Reading"."type" = 'GOSPEL';

-- Sep 03
UPDATE "Reading" SET "sourceKey" = 'reading-0903-proper-first-1cor3' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0903-proper-434' AND "Reading"."type" = 'FIRST_READING';
UPDATE "Reading" SET "sourceKey" = 'reading-0903-proper-psalm-24' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0903-proper-434' AND "Reading"."type" = 'RESPONSORIAL_PSALM';
UPDATE "Reading" SET "sourceKey" = 'reading-0903-proper-gospel-luke5' FROM "ReadingSet" s WHERE "Reading"."readingSetId" = s.id AND s."sourceKey" = 'set-0903-proper-434' AND "Reading"."type" = 'GOSPEL';
