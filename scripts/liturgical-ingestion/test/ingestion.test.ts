import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { validateIngestionPackage } from '../src/validator.js';
import { computePackageHash, computeTextChecksum } from '../src/hash.js';
import { generateReconciliationReport } from '../src/reconciliation.js';
import { verifyPackageApproval } from '../src/approval.js';
import { sanitizeScriptureText } from '../src/normalizer.js';
import { applyIngestionPackage } from '../src/applier.js';
import { mapModernPsalmToDouayRheims } from '../src/scripture-resolver.js';
import { SourceIngestionPackage } from '../src/types.js';

const validFixture: SourceIngestionPackage = {
  metadata: {
    packageName: 'test-valid-pkg',
    sourceName: 'Test Valid Source',
    sourceType: 'CANONICAL_SCRIPTURE_AND_LITURGY',
    sourceVersion: '1.0.0',
    extractionTimestamp: '2026-08-28T19:00:00Z',
    periodCovered: { start: '2026-08-28', end: '2026-08-28' },
    scriptureTranslation: 'Douay-Rheims',
    licensingBasis: 'Public Domain',
    reviewerStatus: 'REVIEWED',
  },
  records: [
    {
      date: '2026-08-28',
      calendarCode: 'UNIVERSAL',
      seasonCode: 'ORDINARY_TIME',
      seasonWeek: 21,
      yearCycle: 'YEAR_B',
      weekdayCycle: 'YEAR_2',
      liturgicalColor: 'WHITE',
      gloriaRequired: false,
      creedRequired: false,
      celebrations: [
        {
          title: 'St. Augustine',
          rank: 'MEMORIAL',
          color: 'WHITE',
          precedenceOrder: 1,
        },
      ],
      readings: [
        {
          type: 'FIRST_READING',
          readingOrder: 1,
          citationRef: '1 Cor 1:17',
          text: 'For Christ sent me not to baptize...',
        },
      ],
    },
  ],
};

test('1. Liturgical Ingestion — Deterministic SHA-256 Hashing', () => {
  const hash1 = computePackageHash(validFixture);
  const hash2 = computePackageHash(validFixture);
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});

test('2. Liturgical Ingestion — Unapproved Translation Rejection', () => {
  const badTranslationPkg: SourceIngestionPackage = {
    ...validFixture,
    metadata: {
      ...validFixture.metadata,
      scriptureTranslation: 'UNAPPROVED_MODERN_TRANSLATION',
    },
  };
  const issues = validateIngestionPackage(badTranslationPkg);
  const blocker = issues.find((i) => i.code === 'UNAPPROVED_TRANSLATION');
  assert.notEqual(blocker, undefined);
  assert.equal(blocker?.severity, 'BLOCKER');
});

test('3. Liturgical Ingestion — Unknown Season & Color Rejection', () => {
  const badSeasonColorPkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      {
        ...validFixture.records[0],
        seasonCode: 'INVALID_SUMMER',
        liturgicalColor: 'TURQUOISE',
      },
    ],
  };
  const issues = validateIngestionPackage(badSeasonColorPkg);
  assert.notEqual(issues.find((i) => i.code === 'UNKNOWN_SEASON'), undefined);
  assert.notEqual(issues.find((i) => i.code === 'UNKNOWN_COLOR'), undefined);
});

test('4. Liturgical Ingestion — Missing Reading Text & Duplicate Order Rejection', () => {
  const badReadingsPkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      {
        ...validFixture.records[0],
        readings: [
          {
            type: 'FIRST_READING',
            readingOrder: 1,
            citationRef: 'Genesis 1:1',
            text: 'Valid reading text',
          },
          {
            type: 'SECOND_READING',
            readingOrder: 1, // Duplicate readingOrder
            citationRef: 'Romans 1:1',
            text: '', // Empty text
          },
        ],
      },
    ],
  };
  const issues = validateIngestionPackage(badReadingsPkg);
  assert.notEqual(issues.find((i) => i.code === 'DUPLICATE_READING_ORDER'), undefined);
  assert.notEqual(issues.find((i) => i.code === 'MISSING_READING_TEXT'), undefined);
});

test('5. Liturgical Ingestion — Duplicate LiturgicalDay Identity Detection', () => {
  const duplicateDayPkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      validFixture.records[0],
      {
        ...validFixture.records[0],
        date: '2026-08-28', // Duplicate date for same calendarCode
      },
    ],
  };
  const issues = validateIngestionPackage(duplicateDayPkg);
  const dupBlocker = issues.find((i) => i.code === 'DUPLICATE_DAY_IN_PACKAGE');
  assert.notEqual(dupBlocker, undefined);
  assert.equal(dupBlocker?.severity, 'BLOCKER');
});

test('6. Liturgical Ingestion — Scripture Text Integrity & Punctuation Preservation', () => {
  const passage = `For "God so loved the world," that he gave his only-begotten Son: that whosoever believeth in him... should not perish!`;
  const cleanText = sanitizeScriptureText(passage);

  assert.equal(cleanText, passage);
  assert.equal(cleanText.includes('"God so loved the world,"'), true);
  assert.equal(cleanText.includes('only-begotten'), true);
  assert.equal(computeTextChecksum(cleanText).length, 64);

  // HTML input tag stripping test
  const htmlInput = `<p>In the beginning was the Word, <script>alert("hack")</script>and the Word was with God.</p>`;
  const cleanHtml = sanitizeScriptureText(htmlInput);
  assert.equal(cleanHtml, 'In the beginning was the Word, and the Word was with God.');
});

test('7. Liturgical Ingestion — Approval Missing returns READY_FOR_HUMAN_APPROVAL', () => {
  const report = generateReconciliationReport(validFixture, []);
  assert.equal(report.approval.hashMatches, false);
  assert.equal(report.verdict, 'READY_FOR_HUMAN_APPROVAL');
});

test('8. Liturgical Ingestion — Approval Hash Invalidation when Source Package Changes', () => {
  const modifiedPkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      {
        ...validFixture.records[0],
        notes: 'Modified note string altering SHA-256 package hash.',
      },
    ],
  };
  const report = generateReconciliationReport(modifiedPkg, []);
  assert.equal(report.approval.hashMatches, false);
  assert.equal(report.verdict, 'READY_FOR_HUMAN_APPROVAL');
});

test('9. Liturgical Ingestion — Validation Blockers CANNOT be Overridden by Approval', () => {
  const blockingIssues = [
    {
      severity: 'BLOCKER' as const,
      code: 'UNKNOWN_SEASON',
      message: 'Unknown season',
    },
  ];
  const report = generateReconciliationReport(validFixture, blockingIssues);
  assert.equal(report.quality.structurallyValid, false);
  assert.equal(report.verdict, 'NOT_READY');
});

test('10. Liturgical Ingestion — Dry-Run Offline Independence (Zero DB Calls)', () => {
  const originalDbUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    const issues = validateIngestionPackage(validFixture);
    const report = generateReconciliationReport(validFixture, issues);

    assert.equal(report.counts.daysTotal, 1);
    assert.equal(report.quality.structurallyValid, true);
    assert.equal(report.operations[0].action, 'WOULD_INSERT');
  } finally {
    if (originalDbUrl) process.env.DATABASE_URL = originalDbUrl;
  }
});

test('11. Liturgical Ingestion — Apply Safety Gates Rejection without --apply or ENV', async () => {
  const dummyReport = generateReconciliationReport(validFixture, []);
  dummyReport.verdict = 'APPROVED_FOR_APPLY';

  const originalEnv = process.env.LITURGY_INGEST_ENV;
  delete process.env.LITURGY_INGEST_ENV;

  try {
    await applyIngestionPackage(validFixture, dummyReport);
    assert.fail('Should have thrown an error due to missing LITURGY_INGEST_ENV');
  } catch (err) {
    assert.equal(
      (err as Error).message.includes('LITURGY_INGEST_ENV=development is required'),
      true
    );
  } finally {
    if (originalEnv) process.env.LITURGY_INGEST_ENV = originalEnv;
  }
});

test('12. Liturgical Ingestion — Apply Rejection when Verdict is NOT APPROVED_FOR_APPLY', async () => {
  const dummyReport = generateReconciliationReport(validFixture, []);
  dummyReport.verdict = 'READY_FOR_HUMAN_APPROVAL';

  process.env.LITURGY_INGEST_ENV = 'development';

  try {
    await applyIngestionPackage(validFixture, dummyReport);
    assert.fail('Should have thrown an error due to unapproved verdict');
  } catch (err) {
    assert.equal(
      (err as Error).message.includes("Apply requires verdict 'APPROVED_FOR_APPLY'"),
      true
    );
  }
});

test('13. Liturgical Ingestion — Real Source Package Dry-Run Validation (0 Blockers, 0 Warnings)', () => {
  const realPkgPath = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/input/universal-roman-2026-08-28-to-2026-09-03.json');

  assert.equal(fs.existsSync(realPkgPath), true);
  const pkg: SourceIngestionPackage = JSON.parse(fs.readFileSync(realPkgPath, 'utf-8'));

  assert.equal(pkg.metadata.scriptureTranslation, 'Douay-Rheims Version, Challoner Revision');
  assert.equal(pkg.records.length, 7);

  const issues = validateIngestionPackage(pkg);
  const blockers = issues.filter((i) => i.severity === 'BLOCKER');
  const warnings = issues.filter((i) => i.severity === 'WARNING');
  assert.equal(blockers.length, 0);
  assert.equal(warnings.length, 0);

  const report = generateReconciliationReport(pkg, issues);
  assert.equal(report.verdict, 'APPROVED_FOR_APPLY');
});

test('14. Liturgical Ingestion — Deterministic Psalm Versification Resolver (Fail-Closed)', () => {
  assert.equal(mapModernPsalmToDouayRheims('Psalm 33:1-2, 4-5, 10-11'), 'Psalm 32:1-2, 4-5, 10-11');
  assert.equal(mapModernPsalmToDouayRheims('Psalm 71:1-2, 3-4a, 5-6ab, 15ab and 17'), 'Psalm 70:1-2, 3-4a, 5-6ab, 15ab and 17');
  assert.equal(mapModernPsalmToDouayRheims('Psalm 63:2, 3-4, 5-6, 8-9'), 'Psalm 62:2, 3-4, 5-6, 8-9');
  assert.equal(mapModernPsalmToDouayRheims('Psalm 119:97, 98, 99, 100, 101, 102'), 'Psalm 118:97, 98, 99, 100, 101, 102');
  assert.equal(mapModernPsalmToDouayRheims('Psalm 145:8-9, 10-11, 12-13ab, 13cd-14'), 'Psalm 144:8-9, 10-11, 12-13ab, 13cd-14');
  assert.equal(mapModernPsalmToDouayRheims('Psalm 24:1bc-2, 3-4ab, 5-6'), 'Psalm 23:1bc-2, 3-4ab, 5-6');

  // Fail-closed test on unmapped chapter
  assert.throws(() => mapModernPsalmToDouayRheims('Psalm 99:1-5'), /Unsupported Psalm chapter '99'/);
});

test('15. Liturgical Ingestion — ReadingSet Architecture & Alternatives Validation', () => {
  const multiSetPkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      {
        ...validFixture.records[0],
        readingSets: [
          {
            context: 'PROPER_OF_SAINTS',
            selectionStatus: 'ALTERNATIVE',
            label: 'Proper Memorial Set Option',
            sourceUrl: 'https://bible.usccb.org/bible/readings/082926.cfm',
            isCanonicalDefault: null,
            readings: [
              {
                type: 'FIRST_READING',
                readingOrder: 1,
                citationRef: 'Jeremias 1:17-19',
                text: 'Proper Jeremias text.',
                textStatus: 'VERIFIED_EXACT',
              },
              {
                type: 'GOSPEL',
                readingOrder: 2,
                citationRef: 'Mark 6:17-29',
                text: 'Proper Mark Gospel text.',
                textStatus: 'VERIFIED_EXACT',
              },
            ],
          },
          {
            context: 'WEEKDAY',
            selectionStatus: 'ALTERNATIVE',
            label: 'Alternative Weekday Set Option',
            sourceUrl: 'https://bible.usccb.org/bible/readings/082926.cfm',
            isCanonicalDefault: null,
            readings: [
              {
                type: 'FIRST_READING',
                readingOrder: 1,
                citationRef: '1 Corinthians 1:26-31',
                text: 'Alternative Corinthians text.',
                textStatus: 'REQUIRES_MANUAL_SEGMENT_REVIEW',
              },
              {
                type: 'GOSPEL',
                readingOrder: 2,
                citationRef: 'Mark 6:17-29',
                text: 'Proper Mark Gospel text.',
                textStatus: 'VERIFIED_EXACT',
              },
            ],
          },
        ],
      },
    ],
  };

  const issues = validateIngestionPackage(multiSetPkg);
  const blockers = issues.filter((i) => i.severity === 'BLOCKER');
  assert.equal(blockers.length, 0);

  const reviewWarning = issues.find((i) => i.code === 'REQUIRES_MANUAL_SEGMENT_REVIEW');
  assert.notEqual(reviewWarning, undefined);

  const hash1 = computePackageHash(multiSetPkg);
  const hash2 = computePackageHash(multiSetPkg);
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});

test('16. Liturgical Ingestion — Aug 29 Multi-Option Canonical Truth (No False Default)', () => {
  const realPkgPath = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/input/universal-roman-2026-08-28-to-2026-09-03.json');
  const pkg: SourceIngestionPackage = JSON.parse(fs.readFileSync(realPkgPath, 'utf-8'));

  const aug29Record = pkg.records.find((r) => r.date === '2026-08-29');
  assert.notEqual(aug29Record, undefined);
  assert.equal(aug29Record?.readingSets?.length, 2);

  const set1 = aug29Record?.readingSets?.[0];
  const set2 = aug29Record?.readingSets?.[1];

  assert.equal(set1?.context, 'PROPER_OF_SAINTS');
  assert.equal(set1?.selectionStatus, 'ALTERNATIVE');
  assert.equal(set1?.isCanonicalDefault, null);

  assert.equal(set2?.context, 'WEEKDAY');
  assert.equal(set2?.selectionStatus, 'ALTERNATIVE');
  assert.equal(set2?.isCanonicalDefault, null);

  // Both sets contain the Proper Gospel Mark 6:17-29
  const gospel1 = set1?.readings.find((r) => r.type === 'GOSPEL');
  const gospel2 = set2?.readings.find((r) => r.type === 'GOSPEL');

  assert.equal(gospel1?.citationRef, 'Mark 6:17-29');
  assert.equal(gospel2?.citationRef, 'Mark 6:17-29');
});

test('17. Liturgical Ingestion — Sub-Verse Manual Verification & Deterministic Hashing Safety', () => {
  const realPkgPath = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/input/universal-roman-2026-08-28-to-2026-09-03.json');
  const pkg: SourceIngestionPackage = JSON.parse(fs.readFileSync(realPkgPath, 'utf-8'));

  // 1. Verify exact checksum of verified package
  const originalHash = computePackageHash(pkg);
  assert.equal(originalHash.length, 64);

  // 2. Editing text payload must deterministically change package hash
  const modifiedPkg: SourceIngestionPackage = JSON.parse(JSON.stringify(pkg));
  if (modifiedPkg.records[0]?.readingSets?.[0]?.readings[0]) {
    modifiedPkg.records[0].readingSets[0].readings[0].text += ' Extra text.';
  }
  const modifiedHash = computePackageHash(modifiedPkg);

  assert.notEqual(originalHash, modifiedHash);

  // 3. Reverting text status to REQUIRES_MANUAL_SEGMENT_REVIEW triggers warning warning
  const unverifiedPkg: SourceIngestionPackage = JSON.parse(JSON.stringify(pkg));
  if (unverifiedPkg.records[0]?.readingSets?.[0]?.readings[0]) {
    unverifiedPkg.records[0].readingSets[0].readings[0].textStatus = 'REQUIRES_MANUAL_SEGMENT_REVIEW';
  }

  const issues = validateIngestionPackage(unverifiedPkg);
  const warning = issues.find((i) => i.code === 'REQUIRES_MANUAL_SEGMENT_REVIEW');
  assert.notEqual(warning, undefined);

  const report = generateReconciliationReport(unverifiedPkg, issues);
  assert.equal(report.verdict, 'REQUIRES_REVIEW');
});

test('18. Liturgical Ingestion — Non-Destructive Apply Idempotency & Entity ID Preservation (Disposable Data)', async () => {
  const { applyIngestionPackage } = await import('../src/applier.js');
  const { prisma } = await import('../../../src/lib/prisma/index.js');

  const testDate = '2099-12-31';
  const testPkg: SourceIngestionPackage = {
    metadata: {
      packageName: 'disposable-idempotency-test',
      sourceName: 'Idempotency Test Source',
      sourceType: 'CANONICAL_SCRIPTURE_AND_LITURGY',
      sourceUrl: 'https://credocatholica.com/test',
      sourceVersion: '1.0.0',
      extractionTimestamp: new Date().toISOString(),
      periodCovered: { start: testDate, end: testDate },
      scriptureTranslation: 'Douay-Rheims Version, Challoner Revision',
      licensingBasis: 'Public Domain',
      reviewerStatus: 'HUMAN_DOCTRINAL_REVIEWED',
    },
    records: [
      {
        date: testDate,
        calendarCode: 'UNIVERSAL',
        seasonCode: 'ORDINARY_TIME',
        seasonWeek: 1,
        yearCycle: 'YEAR_A',
        weekdayCycle: 'YEAR_1',
        liturgicalColor: 'GREEN',
        gloriaRequired: false,
        creedRequired: false,
        notes: 'Disposable test day for idempotency validation.',
        celebrations: [
          {
            title: 'Disposable Test Saint Celebration',
            slug: 'disposable-test-saint-celebration',
            rank: 'MEMORIAL',
            color: 'WHITE',
          },
        ],
        readingSets: [
          {
            context: 'WEEKDAY',
            selectionStatus: 'SOLE_SET',
            label: 'Test Reading Set',
            setOrder: 1,
            sourceUrl: 'https://credocatholica.com/test-set',
            readings: [
              {
                type: 'FIRST_READING',
                readingOrder: 1,
                citationRef: 'Genesis 1:1',
                text: 'In the beginning God created heaven, and earth.',
                textStatus: 'VERIFIED_EXACT',
              },
            ],
          },
        ],
      },
    ],
  };

  const mockReport: any = { verdict: 'APPROVED_FOR_APPLY' };
  process.env.LITURGY_INGEST_ENV = 'development';

  try {
    // First Apply
    const res1 = await applyIngestionPackage(testPkg, mockReport);
    assert.equal(res1?.insertedDays, 1);
    assert.equal(res1?.insertedCelebrations, 1);
    assert.equal(res1?.insertedReadingSets, 1);
    assert.equal(res1?.insertedReadings, 1);

    const day1 = await prisma.liturgicalDay.findUnique({
      where: { calendarCode_date: { calendarCode: 'UNIVERSAL', date: new Date(testDate) } },
      include: {
        celebrations: { include: { celebration: true } },
        readingSets: { include: { readings: true } },
      },
    });

    assert.notEqual(day1, null);
    const dayId1 = day1!.id;
    const celId1 = day1!.celebrations[0].celebration.id;
    const setId1 = day1!.readingSets[0].id;
    const readingId1 = day1!.readingSets[0].readings[0].id;

    // Second Apply (Identical Package)
    const res2 = await applyIngestionPackage(testPkg, mockReport);
    assert.equal(res2?.insertedDays, 0);
    assert.equal(res2?.updatedDays, 1);
    assert.equal(res2?.insertedCelebrations, 0);
    assert.equal(res2?.updatedCelebrations, 1);
    assert.equal(res2?.insertedReadingSets, 0);
    assert.equal(res2?.updatedReadingSets, 1);
    assert.equal(res2?.insertedReadings, 0);
    assert.equal(res2?.updatedReadings, 1);

    const day2 = await prisma.liturgicalDay.findUnique({
      where: { calendarCode_date: { calendarCode: 'UNIVERSAL', date: new Date(testDate) } },
      include: {
        celebrations: { include: { celebration: true } },
        readingSets: { include: { readings: true } },
      },
    });

    const dayId2 = day2!.id;
    const celId2 = day2!.celebrations[0].celebration.id;
    const setId2 = day2!.readingSets[0].id;
    const readingId2 = day2!.readingSets[0].readings[0].id;

    // Prove 100% ID Survival & Non-Destructive Operation
    assert.equal(dayId1, dayId2);
    assert.equal(celId1, celId2);
    assert.equal(setId1, setId2);
    assert.equal(readingId1, readingId2);
  } finally {
    // Clean up disposable test data
    await prisma.liturgicalDay.deleteMany({
      where: { calendarCode: 'UNIVERSAL', date: new Date(testDate) },
    });
    await prisma.celebration.deleteMany({
      where: { slug: 'disposable-test-saint-celebration' },
    });
  }
});

test('19. Liturgical Ingestion — Stable Source Key Identity Survival Across Reordering, Middle Insertion & Set Shifts', async () => {
  const { applyIngestionPackage } = await import('../src/applier.js');
  const { prisma } = await import('../../../src/lib/prisma/index.js');

  const testDate = '2099-12-30';
  const mockReport: any = { verdict: 'APPROVED_FOR_APPLY' };
  process.env.LITURGY_INGEST_ENV = 'development';

  try {
    // 1. Initial Apply: Weekday set with First Reading (order 1) and Gospel (order 2)
    const pkg1: SourceIngestionPackage = {
      metadata: {
        packageName: 'correction-scenario-test',
        sourceName: 'Correction Test',
        sourceType: 'CANONICAL_SCRIPTURE_AND_LITURGY',
        sourceVersion: '1.0.0',
        extractionTimestamp: new Date().toISOString(),
        periodCovered: { start: testDate, end: testDate },
        scriptureTranslation: 'Douay-Rheims Version, Challoner Revision',
        licensingBasis: 'Public Domain',
        reviewerStatus: 'HUMAN_DOCTRINAL_REVIEWED',
      },
      records: [
        {
          date: testDate,
          calendarCode: 'UNIVERSAL',
          seasonCode: 'ORDINARY_TIME',
          yearCycle: 'YEAR_A',
          weekdayCycle: 'YEAR_1',
          liturgicalColor: 'GREEN',
          gloriaRequired: false,
          creedRequired: false,
          celebrations: [],
          readingSets: [
            {
              context: 'WEEKDAY',
              sourceKey: 'set-weekday-test',
              label: 'Weekday Readings',
              setOrder: 1,
              sourceUrl: 'https://credocatholica.com/test-1',
              readings: [
                {
                  type: 'FIRST_READING',
                  sourceKey: 'first-reading-test-key',
                  readingOrder: 1,
                  citationRef: 'Genesis 1:1',
                  text: 'In the beginning God created heaven, and earth.',
                  textStatus: 'VERIFIED_EXACT',
                },
                {
                  type: 'GOSPEL',
                  sourceKey: 'gospel-test-key',
                  readingOrder: 2,
                  citationRef: 'John 1:1',
                  text: 'In the beginning was the Word.',
                  textStatus: 'VERIFIED_EXACT',
                },
              ],
            },
          ],
        },
      ],
    };

    await applyIngestionPackage(pkg1, mockReport);

    const dayState1 = await prisma.liturgicalDay.findUnique({
      where: { calendarCode_date: { calendarCode: 'UNIVERSAL', date: new Date(testDate) } },
      include: { readingSets: { include: { readings: true } } },
    });

    const weekdaySetId1 = dayState1!.readingSets[0].id;
    const firstReadingId1 = dayState1!.readingSets[0].readings.find(r => r.type === 'FIRST_READING')!.id;
    const gospelId1 = dayState1!.readingSets[0].readings.find(r => r.type === 'GOSPEL')!.id;

    // 2. Second Apply: Insert Gospel Acclamation at order 2, shifting Gospel to order 3
    const pkg2: SourceIngestionPackage = {
      ...pkg1,
      records: [
        {
          ...pkg1.records[0],
          readingSets: [
            {
              context: 'WEEKDAY',
              sourceKey: 'set-weekday-test',
              label: 'Weekday Readings',
              setOrder: 1,
              sourceUrl: 'https://credocatholica.com/test-1',
              readings: [
                {
                  type: 'FIRST_READING',
                  sourceKey: 'first-reading-test-key',
                  readingOrder: 1,
                  citationRef: 'Genesis 1:1',
                  text: 'In the beginning God created heaven, and earth.',
                  textStatus: 'VERIFIED_EXACT',
                },
                {
                  type: 'GOSPEL_ACCLAMATION',
                  sourceKey: 'gospel-acclamation-test-key',
                  readingOrder: 2,
                  citationRef: 'Alleluia',
                  text: 'Alleluia, alleluia.',
                  textStatus: 'VERIFIED_EXACT',
                },
                {
                  type: 'GOSPEL',
                  sourceKey: 'gospel-test-key',
                  readingOrder: 3,
                  citationRef: 'John 1:1',
                  text: 'In the beginning was the Word.',
                  textStatus: 'VERIFIED_EXACT',
                },
              ],
            },
          ],
        },
      ],
    };

    const res2 = await applyIngestionPackage(pkg2, mockReport);
    assert.equal(res2?.insertedReadings, 1); // 1 Gospel Acclamation inserted
    assert.equal(res2?.updatedReadings, 2);  // First Reading and Gospel updated

    const dayState2 = await prisma.liturgicalDay.findUnique({
      where: { calendarCode_date: { calendarCode: 'UNIVERSAL', date: new Date(testDate) } },
      include: { readingSets: { include: { readings: { orderBy: { readingOrder: 'asc' } } } } },
    });

    const readings2 = dayState2!.readingSets[0].readings;
    assert.equal(readings2.length, 3);
    assert.equal(readings2[0].type, 'FIRST_READING');
    assert.equal(readings2[1].type, 'GOSPEL_ACCLAMATION');
    assert.equal(readings2[2].type, 'GOSPEL');
    assert.equal(readings2[2].readingOrder, 3);

    // Assert Gospel ID survived order shift!
    const gospelId2 = dayState2!.readingSets[0].readings.find(r => r.type === 'GOSPEL')!.id;
    assert.equal(gospelId1, gospelId2);
    assert.equal(firstReadingId1, dayState2!.readingSets[0].readings.find(r => r.type === 'FIRST_READING')!.id);

    // 3. Third Apply: Insert an alternative PROPER_OF_SAINTS set at setOrder 1, shifting WEEKDAY to setOrder 2
    const pkg3: SourceIngestionPackage = {
      ...pkg1,
      records: [
        {
          ...pkg1.records[0],
          readingSets: [
            {
              context: 'PROPER_OF_SAINTS',
              sourceKey: 'set-proper-saints-test',
              label: 'Proper Saints Set',
              setOrder: 1,
              sourceUrl: 'https://credocatholica.com/test-proper',
              readings: [
                {
                  type: 'FIRST_READING',
                  sourceKey: 'proper-first-test-key',
                  readingOrder: 1,
                  citationRef: 'Apocalypse 1:1',
                  text: 'The Revelation of Jesus Christ.',
                  textStatus: 'VERIFIED_EXACT',
                },
              ],
            },
            {
              context: 'WEEKDAY',
              sourceKey: 'set-weekday-test',
              label: 'Weekday Readings',
              setOrder: 2,
              sourceUrl: 'https://credocatholica.com/test-1',
              readings: [
                {
                  type: 'FIRST_READING',
                  sourceKey: 'first-reading-test-key',
                  readingOrder: 1,
                  citationRef: 'Genesis 1:1',
                  text: 'In the beginning God created heaven, and earth.',
                  textStatus: 'VERIFIED_EXACT',
                },
                {
                  type: 'GOSPEL',
                  sourceKey: 'gospel-test-key',
                  readingOrder: 2,
                  citationRef: 'John 1:1',
                  text: 'In the beginning was the Word.',
                  textStatus: 'VERIFIED_EXACT',
                },
              ],
            },
          ],
        },
      ],
    };

    const res3 = await applyIngestionPackage(pkg3, mockReport);
    assert.equal(res3?.insertedReadingSets, 1); // Proper Saints set inserted
    assert.equal(res3?.updatedReadingSets, 1);  // Weekday set updated (order shifted to 2)

    const dayState3 = await prisma.liturgicalDay.findUnique({
      where: { calendarCode_date: { calendarCode: 'UNIVERSAL', date: new Date(testDate) } },
      include: { readingSets: { orderBy: { setOrder: 'asc' } } },
    });

    assert.equal(dayState3!.readingSets.length, 2);
    const weekdaySet3 = dayState3!.readingSets.find(s => s.context === 'WEEKDAY')!;
    assert.equal(weekdaySet3.id, weekdaySetId1);
    assert.equal(weekdaySet3.setOrder, 2);

    // 4. Fourth Apply: Re-apply pkg1 omitting GOSPEL_ACCLAMATION & PROPER_OF_SAINTS set (NON-DESTRUCTIVE OMISSION)
    const res4 = await applyIngestionPackage(pkg1, mockReport);
    assert.equal(res4?.omittedRetainedSets, 1);
    assert.equal(res4?.omittedRetainedReadings, 1);

    const dayState4 = await prisma.liturgicalDay.findUnique({
      where: { calendarCode_date: { calendarCode: 'UNIVERSAL', date: new Date(testDate) } },
      include: { readingSets: { include: { readings: true } } },
    });

    // Omitted rows are RETAINED in DB
    assert.equal(dayState4!.readingSets.length, 2);

    // 5. Fifth Apply: Apply package with EXPLICIT DELETION instructions
    const pkgDeletion: SourceIngestionPackage = {
      ...pkg1,
      metadata: {
        ...pkg1.metadata,
        deletions: [
          {
            entityType: 'READING_SET',
            sourceKey: 'set-proper-saints-test',
            reason: 'Explicitly reviewed removal of disposable test set',
          },
          {
            entityType: 'READING',
            sourceKey: 'gospel-acclamation-test-key',
            reason: 'Explicitly reviewed removal of disposable test acclamation',
          },
        ],
      },
      records: [
        {
          ...pkg1.records[0],
          readingSets: [
            {
              context: 'WEEKDAY',
              sourceKey: 'set-weekday-test',
              label: 'Weekday Readings',
              setOrder: 1,
              sourceUrl: 'https://credocatholica.com/test-1',
              readings: [
                {
                  type: 'FIRST_READING',
                  sourceKey: 'first-reading-test-key',
                  readingOrder: 1,
                  citationRef: 'Genesis 1:1',
                  text: 'In the beginning God created heaven, and earth.',
                  textStatus: 'VERIFIED_EXACT',
                },
                {
                  type: 'GOSPEL',
                  sourceKey: 'gospel-test-key',
                  readingOrder: 2,
                  citationRef: 'John 1:1',
                  text: 'In the beginning was the Word.',
                  textStatus: 'VERIFIED_EXACT',
                },
              ],
            },
          ],
        },
      ],
    };

    const res5 = await applyIngestionPackage(pkgDeletion, mockReport);
    assert.equal(res5?.explicitlyDeletedSets, 1);
    assert.equal(res5?.explicitlyDeletedReadings, 1);

    const dayState5 = await prisma.liturgicalDay.findUnique({
      where: { calendarCode_date: { calendarCode: 'UNIVERSAL', date: new Date(testDate) } },
      include: { readingSets: { include: { readings: true } } },
    });

    // Only 1 set remains after explicit deletion
    assert.equal(dayState5!.readingSets.length, 1);
    assert.equal(dayState5!.readingSets[0].id, weekdaySetId1);
    assert.equal(dayState5!.readingSets[0].readings.find((r) => r.type === 'GOSPEL')!.id, gospelId1);
  } finally {
    await prisma.liturgicalDay.deleteMany({
      where: { calendarCode: 'UNIVERSAL', date: new Date(testDate) },
    });
  }
});

test('20. Liturgical Ingestion — SourceKey Collision, Type Correction & Coexistence Validation', () => {
  // A. Duplicate ReadingSet sourceKey rejected
  const dupSetKeyPkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      {
        ...validFixture.records[0],
        readingSets: [
          {
            context: 'PROPER_OF_SAINTS',
            sourceKey: 'duplicate-set-key',
            label: 'Set 1',
            sourceUrl: 'https://credocatholica.com/test',
            readings: [
              { type: 'GOSPEL', sourceKey: 'r1', readingOrder: 1, citationRef: 'Mark 1:1', text: 'Sample text' },
            ],
          },
          {
            context: 'WEEKDAY',
            sourceKey: 'duplicate-set-key', // Collision
            label: 'Set 2',
            sourceUrl: 'https://credocatholica.com/test',
            readings: [
              { type: 'GOSPEL', sourceKey: 'r2', readingOrder: 1, citationRef: 'Mark 1:1', text: 'Sample text' },
            ],
          },
        ],
      },
    ],
  };

  const issues1 = validateIngestionPackage(dupSetKeyPkg);
  assert.notEqual(issues1.find((i) => i.code === 'DUPLICATE_READING_SET_SOURCE_KEY'), undefined);

  // B. Duplicate Reading sourceKey in same set rejected
  const dupReadingKeyPkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      {
        ...validFixture.records[0],
        readingSets: [
          {
            context: 'WEEKDAY',
            sourceKey: 'set-unique-1',
            label: 'Set 1',
            sourceUrl: 'https://credocatholica.com/test',
            readings: [
              { type: 'FIRST_READING', sourceKey: 'reading-dup-key', readingOrder: 1, citationRef: 'Genesis 1:1', text: 'Text 1' },
              { type: 'GOSPEL', sourceKey: 'reading-dup-key', readingOrder: 2, citationRef: 'John 1:1', text: 'Text 2' },
            ],
          },
        ],
      },
    ],
  };

  const issues2 = validateIngestionPackage(dupReadingKeyPkg);
  assert.notEqual(issues2.find((i) => i.code === 'DUPLICATE_READING_SOURCE_KEY'), undefined);

  // C. Multiple readings of same type coexist when sourceKeys differ
  const multiSameTypePkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      {
        ...validFixture.records[0],
        readingSets: [
          {
            context: 'WEEKDAY',
            sourceKey: 'set-multi-reading-test',
            label: 'Multi Reading Test',
            sourceUrl: 'https://credocatholica.com/test',
            readings: [
              { type: 'OTHER', sourceKey: 'reading-other-long', readingOrder: 1, citationRef: 'Isaiah 7:10', text: 'Longer form text' },
              { type: 'OTHER', sourceKey: 'reading-other-short', readingOrder: 2, citationRef: 'Isaiah 7:10-14', text: 'Shorter form text' },
            ],
          },
        ],
      },
    ],
  };

  const issues3 = validateIngestionPackage(multiSameTypePkg);
  const blockers3 = issues3.filter((i) => i.severity === 'BLOCKER');
  assert.equal(blockers3.length, 0);
});

test('21. Liturgical Ingestion — Deterministic Crossed Proper Source Identity Invariant Rejection', () => {
  const crossedPkg: SourceIngestionPackage = {
    metadata: {
      packageName: 'crossed-identity-test',
      sourceName: 'Crossed Test Source',
      sourceType: 'CANONICAL_SCRIPTURE_AND_LITURGY',
      sourceUrl: 'https://credocatholica.com/test',
      sourceVersion: '1.0.0',
      extractionTimestamp: new Date().toISOString(),
      periodCovered: { start: '2026-10-16', end: '2026-10-16' },
      scriptureTranslation: 'Douay-Rheims Version, Challoner Revision',
      licensingBasis: 'Public Domain',
      reviewerStatus: 'HUMAN_DOCTRINAL_REVIEWED',
    },
    records: [
      {
        date: '2026-10-16',
        calendarCode: 'UNIVERSAL',
        seasonCode: 'ORDINARY_TIME',
        seasonWeek: 28,
        yearCycle: 'YEAR_A',
        weekdayCycle: 'YEAR_2',
        liturgicalColor: 'GREEN',
        gloriaRequired: false,
        creedRequired: false,
        celebrations: [],
        readingSets: [
          {
            sourceKey: 'set-1016-proper-st-hedwig-659',
            context: 'PROPER_OF_SAINTS',
            selectionStatus: 'ALTERNATIVE',
            label: 'Proper Mass Readings for Saint Hedwig, Religious (Lectionary 659)',
            setOrder: 1,
            isCanonicalDefault: null,
            lectionaryNumber: '659',
            sourceUrl: 'https://bible.usccb.org/bible/readings/101626.cfm',
            readings: [
              {
                sourceKey: 'reading-1016-proper-hedwig-first-2cor8',
                type: 'FIRST_READING',
                readingOrder: 1,
                citationRef: '2 Corinthians 8:1-9',
                scriptureRef: '2 Corinthians 8:1-9',
                textStatus: 'VERIFIED_EXACT',
                text: 'Test text',
              },
            ],
          },
        ],
      },
    ],
  };

  const issues = validateIngestionPackage(crossedPkg);
  const crossedIssue = issues.find((i) => i.code === 'CROSSED_SOURCE_IDENTITY');
  assert.notEqual(crossedIssue, undefined);
  assert.equal(crossedIssue?.severity, 'BLOCKER');
});

test('22. Liturgical Ingestion — General Roman Calendar Amendments & Freshness Invariant Validation', () => {
  const stalePkg: SourceIngestionPackage = {
    metadata: {
      packageName: 'stale-amendment-test',
      sourceName: 'Stale Amendment Test Source',
      sourceType: 'CANONICAL_SCRIPTURE_AND_LITURGY',
      sourceUrl: 'https://credocatholica.com/test',
      sourceVersion: '1.0.0',
      extractionTimestamp: new Date().toISOString(),
      periodCovered: { start: '2026-09-05', end: '2026-09-05' },
      scriptureTranslation: 'Douay-Rheims Version, Challoner Revision',
      licensingBasis: 'Public Domain',
      reviewerStatus: 'HUMAN_DOCTRINAL_REVIEWED',
    },
    records: [
      {
        date: '2026-09-05',
        calendarCode: 'UNIVERSAL',
        seasonCode: 'ORDINARY_TIME',
        seasonWeek: 22,
        yearCycle: 'YEAR_B',
        weekdayCycle: 'YEAR_2',
        liturgicalColor: 'GREEN',
        gloriaRequired: false,
        creedRequired: false,
        celebrations: [], // Missing St. Teresa of Calcutta!
        readingSets: [],
      },
    ],
  };

  const issues = validateIngestionPackage(stalePkg);
  const staleIssue = issues.find((i) => i.code === 'STALE_CALENDAR_AMENDMENT_OMITTED');
  assert.notEqual(staleIssue, undefined);
  assert.equal(staleIssue?.severity, 'BLOCKER');
  assert.match(staleIssue?.message || '', /Saint Teresa of Calcutta/);
});

test('23. Liturgical Ingestion — Historical Amendment Package Validation & Dry-Run (0 Blockers, 0 Warnings)', () => {
  const amendmentPkgPath = path.resolve(
    process.cwd(),
    'scripts/liturgical-ingestion/input/universal-roman-2026-historical-amendment-001.json'
  );
  assert.equal(fs.existsSync(amendmentPkgPath), true);
  const rawContent = fs.readFileSync(amendmentPkgPath, 'utf-8');
  const pkg: SourceIngestionPackage = JSON.parse(rawContent);

  const issues = validateIngestionPackage(pkg);
  const blockers = issues.filter((i) => i.severity === 'BLOCKER');
  const warnings = issues.filter((i) => i.severity === 'WARNING');

  assert.equal(blockers.length, 0);
  assert.equal(warnings.length, 0);
});

test('24. Liturgical Ingestion — SEMANTIC_READING_DUPLICATE Validation & Fail-Closed Blocker', () => {
  const dupPkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      {
        ...validFixture.records[0],
        readingSets: [
          {
            context: 'PROPER_OF_SAINTS',
            sourceKey: 'set-dup-test',
            label: 'Duplicate Test Set',
            sourceUrl: 'https://credocatholica.com/test',
            readings: [
              {
                type: 'FIRST_READING',
                sourceKey: 'r-dup-1',
                readingOrder: 1,
                citationRef: 'Isaiah 58:6-11',
                text: 'Some text 1',
              },
              {
                type: 'FIRST_READING', // Accidental duplicate type inside same set!
                sourceKey: 'r-dup-2',
                readingOrder: 2,
                citationRef: 'Isaiah 58:6-11',
                text: 'Some text 2',
              },
            ],
          },
        ],
      },
    ],
  };

  const issues = validateIngestionPackage(dupPkg);
  const dupIssue = issues.find((i) => i.code === 'SEMANTIC_READING_DUPLICATE');
  assert.notEqual(dupIssue, undefined);
  assert.equal(dupIssue?.severity, 'BLOCKER');
});

test('25. Liturgical Ingestion — Historical Amendment 002 Validation & Dry-Run (0 Blockers, 0 Warnings)', () => {
  const amendment2Path = path.resolve(
    process.cwd(),
    'scripts/liturgical-ingestion/input/universal-roman-2026-historical-amendment-002.json'
  );
  assert.equal(fs.existsSync(amendment2Path), true);
  const rawContent = fs.readFileSync(amendment2Path, 'utf-8');
  const pkg: SourceIngestionPackage = JSON.parse(rawContent);

  const issues = validateIngestionPackage(pkg);
  const blockers = issues.filter((i) => i.severity === 'BLOCKER');
  const warnings = issues.filter((i) => i.severity === 'WARNING');

  assert.equal(blockers.length, 0);
  assert.equal(warnings.length, 0);

  const report = generateReconciliationReport(pkg, issues);
  assert.equal(report.verdict === 'READY_FOR_HUMAN_APPROVAL' || report.verdict === 'APPROVED_FOR_APPLY', true);
  assert.equal(pkg.metadata.deletions?.length, 6);
  assert.equal(report.counts.daysTotal, 1);
});

test('26. Liturgical Ingestion — UNREVIEWED_READING_REPLACEMENT Validation & Fail-Closed Blocker', () => {
  const unreviewedReplacementPkg: SourceIngestionPackage = {
    ...validFixture,
    records: [
      {
        ...validFixture.records[0],
        readingSets: [
          {
            context: 'PROPER_OF_SAINTS',
            sourceKey: 'set-unreviewed-replacement-test',
            label: 'Unreviewed Replacement Test Set',
            sourceUrl: 'https://credocatholica.com/test',
            readings: [
              {
                type: 'GOSPEL',
                sourceKey: 'r-gospel-orig',
                readingOrder: 3,
                citationRef: 'Matthew 5:13-16',
                text: 'You are the salt of the earth...',
              },
              {
                type: 'GOSPEL', // Conflicting pericope in same set!
                sourceKey: 'r-gospel-new',
                readingOrder: 3,
                citationRef: 'Matthew 10:28-33',
                text: 'Fear ye not them that kill the body...',
              },
            ],
          },
        ],
      },
    ],
  };

  const issues = validateIngestionPackage(unreviewedReplacementPkg);
  const replacementIssue = issues.find((i) => i.code === 'UNREVIEWED_READING_REPLACEMENT');
  assert.notEqual(replacementIssue, undefined);
  assert.equal(replacementIssue?.severity, 'BLOCKER');
});










