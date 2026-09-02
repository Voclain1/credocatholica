import fs from 'node:fs';
import path from 'node:path';
import { computePackageHash } from './src/hash.js';

const targetPackages = [
  {
    id: 'Amendment 001',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-historical-amendment-001.json',
    expectedHash: 'ecd6bda7854d36dee8017b9747d3f2199257d38c07acf83751a79d960b9c8e56'
  },
  {
    id: 'Package 6',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-10-23-to-2026-11-05.json',
    expectedHash: '2fe3ef693a529dd7836e437c0d8ca895349788e276a244ae2fd19168c693377d'
  },
  {
    id: 'Package 7',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-11-06-to-2026-11-19.json',
    expectedHash: '93fe3674e0d25ed4ae7b0b66fb7e3f638bf1b402e2be649b039f71105342156e'
  },
  {
    id: 'Package 8',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-11-20-to-2026-12-03.json',
    expectedHash: 'a28cb924218e14eeb1ed24bc36f12e970e5f86e6297ce19d99a9c95c62fb8756'
  },
  {
    id: 'Package 9',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-12-04-to-2026-12-17.json',
    expectedHash: '1f562b038d36724c26b31bd4d18f236dddaadabd7e633a648fe53eeb21e00b39'
  },
  {
    id: 'Package 10',
    file: 'scripts/liturgical-ingestion/input/universal-roman-2026-12-18-to-2026-12-31.json',
    expectedHash: 'e12769356105556223c40bf46ea30eb09d94e29e14af99bf6bf65c77412e7f66'
  }
];

let allMatch = true;

for (const pkg of targetPackages) {
  const fullPath = path.resolve(process.cwd(), pkg.file);
  const pkgData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  const actualHash = computePackageHash(pkgData);
  const matches = actualHash === pkg.expectedHash;
  if (!matches) allMatch = false;
  console.log(`[${pkg.id}] ${matches ? 'MATCH ✓' : 'MISMATCH ✗'}`);
  console.log(`  File: ${pkg.file}`);
  console.log(`  Expected: ${pkg.expectedHash}`);
  console.log(`  Actual:   ${actualHash}`);
}

if (!allMatch) {
  console.error('\nERROR: One or more package hashes do NOT match expected approved hashes!');
  process.exit(1);
} else {
  console.log('\nSUCCESS: All 6 package SHA-256 hashes match approved values perfectly!');
}
