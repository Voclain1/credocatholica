import fs from 'node:fs';
import path from 'node:path';

function main() {
  const file = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/input/universal-roman-2026-08-28-to-2026-09-03.json');
  const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'));

  pkg.metadata.sourceVersion = '2.5.0';

  for (const record of pkg.records) {
    if (record.date === '2026-08-29') {
      for (const rSet of record.readingSets || []) {
        if (rSet.context === 'WEEKDAY') {
          rSet.sourceKey = 'set-0829-weekday-430';
          rSet.lectionaryNumber = '430';
        }
      }
    }
  }

  fs.writeFileSync(file, JSON.stringify(pkg, null, 2), 'utf-8');
  console.log('Updated package v2.5.0 (August 29 Weekday sourceKey set-0829-weekday-430) successfully.');
}

main();
