import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
process.env.LITURGY_INGEST_ENV = 'development';

import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../../src/lib/prisma/index.js';
import { SourceIngestionPackage } from './src/types.js';
import { validateIngestionPackage } from './src/validator.js';
import { generateReconciliationReport, writeReportFiles } from './src/reconciliation.js';
import { applyIngestionPackage } from './src/applier.js';

const packagesToApply = [
  { name: 'Historical Amendment 001', file: 'scripts/liturgical-ingestion/input/universal-roman-2026-historical-amendment-001.json' },
  { name: 'Package 6', file: 'scripts/liturgical-ingestion/input/universal-roman-2026-10-23-to-2026-11-05.json' },
  { name: 'Package 7', file: 'scripts/liturgical-ingestion/input/universal-roman-2026-11-06-to-2026-11-19.json' },
  { name: 'Package 8', file: 'scripts/liturgical-ingestion/input/universal-roman-2026-11-20-to-2026-12-03.json' },
  { name: 'Package 9', file: 'scripts/liturgical-ingestion/input/universal-roman-2026-12-04-to-2026-12-17.json' },
  { name: 'Package 10', file: 'scripts/liturgical-ingestion/input/universal-roman-2026-12-18-to-2026-12-31.json' }
];

async function logDbCounts(header: string) {
  console.log(`\n=== DB STATE: ${header} ===`);
  console.log(`  LiturgicalSeason: ${await prisma.liturgicalSeason.count()}`);
  console.log(`  LiturgicalDay:    ${await prisma.liturgicalDay.count()}`);
  console.log(`  Celebration:      ${await prisma.celebration.count()}`);
  console.log(`  ReadingSet:       ${await prisma.readingSet.count()}`);
  console.log(`  Reading:          ${await prisma.reading.count()}`);
}

async function main() {
  await logDbCounts('BASELINE BEFORE APPLY');

  for (const p of packagesToApply) {
    const fullPath = path.resolve(process.cwd(), p.file);
    console.log(`\n=======================================================`);
    console.log(`APPLYING: ${p.name} (${p.file})`);
    console.log(`=======================================================`);

    const rawContent = fs.readFileSync(fullPath, 'utf-8');
    const pkg: SourceIngestionPackage = JSON.parse(rawContent);

    // Existing dates set
    const existingDays = await prisma.liturgicalDay.findMany({ select: { date: true } });
    const existingDatesSet = new Set(existingDays.map((d) => d.date.toISOString().substring(0, 10)));

    const issues = validateIngestionPackage(pkg);
    const report = generateReconciliationReport(pkg, issues, existingDatesSet);
    const { mdPath, jsonPath } = writeReportFiles(report);

    console.log(`Report Generated: ${mdPath}`);
    console.log(`Verdict: ${report.verdict}`);

    if (report.verdict !== 'APPROVED_FOR_APPLY') {
      throw new Error(`APPLY ABORTED for ${p.name}: Verdict is '${report.verdict}'!`);
    }

    const applyResult = await applyIngestionPackage(pkg, report);

    if (applyResult) {
      console.log(`APPLY SUCCESSFUL for ${p.name}:`);
      console.log(`  Inserted Days: ${applyResult.insertedDays}, Updated Days: ${applyResult.updatedDays}`);
      console.log(`  Inserted Celebrations: ${applyResult.insertedCelebrations}`);
      console.log(`  Inserted ReadingSets: ${applyResult.insertedReadingSets}`);
      console.log(`  Inserted Readings: ${applyResult.insertedReadings}`);
    }

    await logDbCounts(`AFTER ${p.name} APPLY`);
  }

  console.log('\n=======================================================');
  console.log('ALL 6 APPROVED PACKAGES APPLIED TO NEON DEVELOPMENT DB!');
  console.log('=======================================================');
}

main()
  .catch((err) => {
    console.error(`FATAL APPLY ERROR: ${err.message}`, err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
