import fs from 'node:fs';
import path from 'node:path';
import { computePackageHash } from './src/hash.js';
import { validateIngestionPackage } from './src/validator.js';
import { generateReconciliationReport } from './src/reconciliation.js';

const pkgPath = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/input/universal-roman-2026-08-28-to-2026-09-03.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

const hash = computePackageHash(pkg);
console.log('Package v2.5.0 Hash:', hash);

const issues = validateIngestionPackage(pkg);
console.log(`Validation: ${issues.filter(i => i.severity === 'BLOCKER').length} Blockers, ${issues.filter(i => i.severity === 'WARNING').length} Warnings`);

const report = generateReconciliationReport(pkg, issues);
console.log('Report Verdict (Before Approval):', report.verdict);
