import fs from 'node:fs';
import path from 'node:path';

function main() {
  const file = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/input/universal-roman-2026-08-28-to-2026-09-03.json');
  const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'));

  pkg.metadata.sourceVersion = '2.4.0';

  const setKeyMap: Record<string, string> = {
    '2026-08-28:PROPER_OF_SAINTS': 'set-0828-proper-430',
    '2026-08-29:PROPER_OF_SAINTS': 'set-0829-proper-634',
    '2026-08-29:WEEKDAY': 'set-0829-weekday-634',
    '2026-08-30:SUNDAY': 'set-0830-sunday-124',
    '2026-08-31:WEEKDAY': 'set-0831-weekday-431',
    '2026-09-01:WEEKDAY': 'set-0901-weekday-432',
    '2026-09-02:WEEKDAY': 'set-0902-weekday-433',
    '2026-09-03:PROPER_OF_SAINTS': 'set-0903-proper-434',
  };

  const readingKeyMap: Record<string, string> = {
    'set-0828-proper-430:FIRST_READING': 'reading-0828-proper-first-1cor1',
    'set-0828-proper-430:RESPONSORIAL_PSALM': 'reading-0828-proper-psalm-33',
    'set-0828-proper-430:GOSPEL': 'reading-0828-proper-gospel-matt25',

    'set-0829-proper-634:FIRST_READING': 'reading-0829-proper-first-jer1',
    'set-0829-proper-634:RESPONSORIAL_PSALM': 'reading-0829-proper-psalm-71',
    'set-0829-proper-634:GOSPEL': 'reading-0829-proper-gospel-mark6',

    'set-0829-weekday-634:FIRST_READING': 'reading-0829-weekday-first-1cor1',
    'set-0829-weekday-634:RESPONSORIAL_PSALM': 'reading-0829-weekday-psalm-33',
    'set-0829-weekday-634:GOSPEL': 'reading-0829-weekday-gospel-mark6',

    'set-0830-sunday-124:FIRST_READING': 'reading-0830-sunday-first-jer20',
    'set-0830-sunday-124:RESPONSORIAL_PSALM': 'reading-0830-sunday-psalm-63',
    'set-0830-sunday-124:SECOND_READING': 'reading-0830-sunday-second-rom12',
    'set-0830-sunday-124:GOSPEL': 'reading-0830-sunday-gospel-matt16',

    'set-0831-weekday-431:FIRST_READING': 'reading-0831-weekday-first-1cor2',
    'set-0831-weekday-431:RESPONSORIAL_PSALM': 'reading-0831-weekday-psalm-119',
    'set-0831-weekday-431:GOSPEL': 'reading-0831-weekday-gospel-luke4',

    'set-0901-weekday-432:FIRST_READING': 'reading-0901-weekday-first-1cor2',
    'set-0901-weekday-432:RESPONSORIAL_PSALM': 'reading-0901-weekday-psalm-145',
    'set-0901-weekday-432:GOSPEL': 'reading-0901-weekday-gospel-luke4',

    'set-0902-weekday-433:FIRST_READING': 'reading-0902-weekday-first-1cor3',
    'set-0902-weekday-433:RESPONSORIAL_PSALM': 'reading-0902-weekday-psalm-33',
    'set-0902-weekday-433:GOSPEL': 'reading-0902-weekday-gospel-luke4',

    'set-0903-proper-434:FIRST_READING': 'reading-0903-proper-first-1cor3',
    'set-0903-proper-434:RESPONSORIAL_PSALM': 'reading-0903-proper-psalm-24',
    'set-0903-proper-434:GOSPEL': 'reading-0903-proper-gospel-luke5',
  };

  for (const record of pkg.records) {
    for (const rSet of record.readingSets || []) {
      const setKeyLookup = `${record.date}:${rSet.context}`;
      const setSourceKey = setKeyMap[setKeyLookup];
      if (setSourceKey) {
        rSet.sourceKey = setSourceKey;
      }
      for (const reading of rSet.readings || []) {
        const readingKeyLookup = `${setSourceKey}:${reading.type}`;
        const readingSourceKey = readingKeyMap[readingKeyLookup];
        if (readingSourceKey) {
          reading.sourceKey = readingSourceKey;
        }
      }
    }
  }

  fs.writeFileSync(file, JSON.stringify(pkg, null, 2), 'utf-8');
  console.log('Updated package v2.4.0 with explicit sourceKeys successfully.');
}

main();
