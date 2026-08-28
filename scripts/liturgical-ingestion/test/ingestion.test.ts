import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateIngestionPackage } from '../src/validator.js';
import { computePackageHash, computeTextChecksum } from '../src/hash.js';
import { generateReconciliationReport } from '../src/reconciliation.js';
import { verifyPackageApproval } from '../src/approval.js';
import { sanitizeScriptureText } from '../src/normalizer.js';
import { applyIngestionPackage } from '../src/applier.js';
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
