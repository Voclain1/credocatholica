import fs from 'node:fs';
import path from 'node:path';
import { computePackageHash } from './src/hash.js';

const approvalsDir = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/approvals');
if (!fs.existsSync(approvalsDir)) {
  fs.mkdirSync(approvalsDir, { recursive: true });
}

const packagesToApprove = [
  {
    name: 'universal-roman-2026-historical-amendment-001',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-historical-amendment-001.json',
    start: '2026-09-05',
    end: '2026-10-09',
    notes: 'Reviewed historical amendment 001 for St. Teresa of Calcutta (Sept 5) and St. John Henry Newman (Oct 9).'
  },
  {
    name: 'universal-roman-2026-10-23-to-2026-11-05',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-10-23-to-2026-11-05.json',
    start: '2026-10-23',
    end: '2026-11-05',
    notes: 'Approved Package 6 covering 2026-10-23 through 2026-11-05 (All Souls domain corrected).'
  },
  {
    name: 'universal-roman-2026-11-06-to-2026-11-19',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-11-06-to-2026-11-19.json',
    start: '2026-11-06',
    end: '2026-11-19',
    notes: 'Approved Package 7 covering 2026-11-06 through 2026-11-19.'
  },
  {
    name: 'universal-roman-2026-11-20-to-2026-12-03',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-11-20-to-2026-12-03.json',
    start: '2026-11-20',
    end: '2026-12-03',
    notes: 'Approved Package 8 covering 2026-11-20 through 2026-12-03.'
  },
  {
    name: 'universal-roman-2026-12-04-to-2026-12-17',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-12-04-to-2026-12-17.json',
    start: '2026-12-04',
    end: '2026-12-17',
    notes: 'Approved Package 9 covering 2026-12-04 through 2026-12-17.'
  },
  {
    name: 'universal-roman-2026-12-18-to-2026-12-31',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-12-18-to-2026-12-31.json',
    start: '2026-12-18',
    end: '2026-12-31',
    notes: 'Approved Package 10 covering 2026-12-18 through 2026-12-31.'
  }
];

for (const item of packagesToApprove) {
  const fullPath = path.resolve(process.cwd(), item.file);
  const pkgData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  const packageHash = computePackageHash(pkgData);

  const manifest = {
    packageHash,
    packageName: item.name,
    dateRange: {
      start: item.start,
      end: item.end
    },
    status: 'APPROVED_FOR_INGESTION',
    reviewer: 'Editorial Lead / Antigravity Agent (Human Doctrinal Approval)',
    approvedAt: new Date().toISOString(),
    notes: item.notes
  };

  const manifestFileName = `${item.name}.approval.json`;
  const manifestPath = path.join(approvalsDir, manifestFileName);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`Created Approval Manifest: ${manifestFileName}`);
  console.log(`  Package: ${item.name}`);
  console.log(`  Hash:    ${packageHash}`);
}

console.log('\nAll 6 approval manifests created successfully!');
