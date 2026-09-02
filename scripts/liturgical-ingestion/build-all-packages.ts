import fs from 'fs';
import path from 'path';
import { buildAndSavePackage, PackageInput } from './build-package-helper.js';
import { pkg6Data } from './data/pkg6-data.js';
import { pkg7Data } from './data/pkg7-data.js';
import { pkg8Data } from './data/pkg8-data.js';
import { pkg9Data } from './data/pkg9-data.js';
import { pkg10Data } from './data/pkg10-data.js';

console.log('=======================================================');
console.log('CredoCatholica — Ingestion Package Generator (Packages 6 to 10)');
console.log('=======================================================');

const res6 = buildAndSavePackage(pkg6Data, 'universal-roman-2026-10-23-to-2026-11-05.json', 'universal-roman-2026-10-23-to-2026-11-05-review.md');
const res7 = buildAndSavePackage(pkg7Data, 'universal-roman-2026-11-06-to-2026-11-19.json', 'universal-roman-2026-11-06-to-2026-11-19-review.md');
const res8 = buildAndSavePackage(pkg8Data, 'universal-roman-2026-11-20-to-2026-12-03.json', 'universal-roman-2026-11-20-to-2026-12-03-review.md');
const res9 = buildAndSavePackage(pkg9Data, 'universal-roman-2026-12-04-to-2026-12-17.json', 'universal-roman-2026-12-04-to-2026-12-17-review.md');
const res10 = buildAndSavePackage(pkg10Data, 'universal-roman-2026-12-18-to-2026-12-31.json', 'universal-roman-2026-12-18-to-2026-12-31-review.md');

console.log('\n=======================================================');
console.log('ALL 5 PACKAGES BUILT AND VALIDATED SUCCESSFULLY!');
console.log('=======================================================');
console.log(`Package 6 Hash:  ${res6.hash}`);
console.log(`Package 7 Hash:  ${res7.hash}`);
console.log(`Package 8 Hash:  ${res8.hash}`);
console.log(`Package 9 Hash:  ${res9.hash}`);
console.log(`Package 10 Hash: ${res10.hash}`);
