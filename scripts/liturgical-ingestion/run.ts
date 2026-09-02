import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { SourceIngestionPackage } from './src/types.js';
import { validateIngestionPackage } from './src/validator.js';
import { generateReconciliationReport, writeReportFiles } from './src/reconciliation.js';
import { applyIngestionPackage } from './src/applier.js';
import { computePackageHash } from './src/hash.js';

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  const isFixtures = args.includes('--fixtures');
  const packageArg = args.find((a) => a.startsWith('--package='));

  let targetPackagePath: string;

  if (packageArg) {
    targetPackagePath = path.resolve(process.cwd(), packageArg.split('=')[1]);
  } else if (isFixtures) {
    targetPackagePath = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/fixtures/valid-package.json');
  } else {
    // Default to input directory or valid fixture fallback
    const inputDir = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/input');
    if (fs.existsSync(inputDir)) {
      const files = fs.readdirSync(inputDir).filter((f) => f.endsWith('.json'));
      if (files.length > 0) {
        targetPackagePath = path.join(inputDir, files[0]);
      } else {
        targetPackagePath = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/fixtures/valid-package.json');
      }
    } else {
      targetPackagePath = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/fixtures/valid-package.json');
    }
  }

  console.log(`=======================================================`);
  console.log(`CredoCatholica — Liturgical Ingestion Engine`);
  console.log(`Mode: ${isApply ? 'APPLY (DATABASE WRITE)' : 'DRY-RUN (ZERO WRITE)'}`);
  console.log(`Package Target: ${targetPackagePath}`);
  console.log(`=======================================================`);

  if (!fs.existsSync(targetPackagePath)) {
    console.error(`ERROR: Target package file not found at ${targetPackagePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(targetPackagePath, 'utf-8');
  const pkg: SourceIngestionPackage = JSON.parse(rawContent);

  const packageHash = computePackageHash(pkg);
  console.log(`Package Name: ${pkg.metadata?.packageName}`);
  console.log(`Package SHA-256: ${packageHash}`);

  // Step 1: Validate ingestion package
  const issues = validateIngestionPackage(pkg);
  const blockers = issues.filter((i) => i.severity === 'BLOCKER');
  const warnings = issues.filter((i) => i.severity === 'WARNING');

  console.log(`Validation Results: ${blockers.length} Blockers, ${warnings.length} Warnings.`);

  // Step 2: Generate reconciliation report
  const report = generateReconciliationReport(pkg, issues);
  const { mdPath, jsonPath } = writeReportFiles(report);

  console.log(`Reconciliation Report Generated:`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  MD:   ${mdPath}`);
  console.log(`Verdict: ${report.verdict}`);

  // Step 3: Optional Apply
  if (isApply) {
    console.log(`\nInitiating Database Apply Safety Checks...`);
    try {
      const result = await applyIngestionPackage(pkg, report);
      console.log(`\nAPPLY SUCCESSFUL! Summary:`);
      console.log(`  Inserted Days: ${result?.insertedDays}`);
      console.log(`  Updated Days: ${result?.updatedDays}`);
      console.log(`  Inserted Celebrations: ${result?.insertedCelebrations}`);
      console.log(`  Updated Celebrations: ${result?.updatedCelebrations}`);
      console.log(`  Inserted ReadingSets: ${result?.insertedReadingSets}`);
      console.log(`  Updated ReadingSets: ${result?.updatedReadingSets}`);
      console.log(`  Inserted Readings: ${result?.insertedReadings}`);
      console.log(`  Updated Readings: ${result?.updatedReadings}`);
      console.log(`  Omitted Retained Sets: ${result?.omittedRetainedSets}`);
      console.log(`  Omitted Retained Readings: ${result?.omittedRetainedReadings}`);
      console.log(`  Explicitly Deleted Sets: ${result?.explicitlyDeletedSets}`);
      console.log(`  Explicitly Deleted Readings: ${result?.explicitlyDeletedReadings}`);
      console.log(`  Failed Days: ${result?.failedDays}`);
    } catch (err) {
      console.error(`\nAPPLY FAILED AND ROLLED BACK: ${(err as Error).message}`);
      process.exit(1);
    }
  } else {
    console.log(`\nDRY-RUN Complete. Zero database modifications made.`);
  }
}

main().catch((err) => {
  console.error(`Fatal ingestion error: ${err.message}`);
  process.exit(1);
});
