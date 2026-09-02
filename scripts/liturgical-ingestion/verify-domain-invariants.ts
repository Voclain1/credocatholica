import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { prisma } from '../../src/lib/prisma/index.js';

async function main() {
  console.log('=== RUNNING FINAL LITURGICAL INVARIANT SPOT-CHECK ===\n');

  // 1. All Souls (Nov 2)
  const nov2 = await prisma.liturgicalDay.findFirst({
    where: { date: new Date('2026-11-02T00:00:00.000Z') },
    include: { celebrations: { include: { celebration: true } }, readingSets: { include: { readings: true } } },
  });
  console.log('--- NOVEMBER 2 (ALL SOULS) ---');
  console.log('  Notes:', nov2?.notes);
  console.log('  Color:', nov2?.liturgicalColor);
  console.log('  Celebrations Count:', nov2?.celebrations.length, '(Expected: 0)');
  console.log('  ReadingSets Count:', nov2?.readingSets.length, '(Expected: 3)');
  nov2?.readingSets.forEach((s) => console.log(`    Set: ${s.sourceKey} (${s.context})`));

  // 2. Advent / Liturgical Year Transition
  const nov22 = await prisma.liturgicalDay.findFirst({
    where: { date: new Date('2026-11-22T00:00:00.000Z') },
    include: { celebrations: { include: { celebration: true } } },
  });
  const nov29 = await prisma.liturgicalDay.findFirst({
    where: { date: new Date('2026-11-29T00:00:00.000Z') },
    include: { celebrations: { include: { celebration: true } } },
  });
  console.log('\n--- ADVENT TRANSITION ---');
  console.log('  Nov 22 (Christ the King): Year Cycle =', nov22?.yearCycle, '(Expected: YEAR_C)');
  console.log('  Nov 29 (First Sunday of Advent): Year Cycle =', nov29?.yearCycle, '(Expected: YEAR_B), Weekday Cycle =', nov29?.weekdayCycle, '(Expected: YEAR_1)');

  // 3. Sept 5 (St Teresa of Calcutta)
  const sep5 = await prisma.liturgicalDay.findFirst({
    where: { date: new Date('2026-09-05T00:00:00.000Z') },
    include: { celebrations: { include: { celebration: true } }, readingSets: true },
  });
  console.log('\n--- SEPTEMBER 5 (TERESA OF CALCUTTA) ---');
  console.log('  Celebrations:', sep5?.celebrations.map((c) => `${c.celebration.title} (${c.celebration.rank}, isOptional=${c.isOptional})`));
  console.log('  ReadingSets:', sep5?.readingSets.map((s) => `${s.sourceKey} (${s.context}, status=${s.selectionStatus})`));

  // 4. Oct 9 (St John Henry Newman)
  const oct9 = await prisma.liturgicalDay.findFirst({
    where: { date: new Date('2026-10-09T00:00:00.000Z') },
    include: { celebrations: { include: { celebration: true } }, readingSets: true },
  });
  console.log('\n--- OCTOBER 9 (JOHN HENRY NEWMAN) ---');
  console.log('  Celebrations:', oct9?.celebrations.map((c) => `${c.celebration.title} (${c.celebration.rank}, isOptional=${c.isOptional})`));
  console.log('  ReadingSets:', oct9?.readingSets.map((s) => `${s.sourceKey} (${s.context}, status=${s.selectionStatus})`));

  // 5. Dec 25 (Christmas Formularies)
  const dec25 = await prisma.liturgicalDay.findFirst({
    where: { date: new Date('2026-12-25T00:00:00.000Z') },
    include: { celebrations: true, readingSets: { include: { readings: true } } },
  });
  console.log('\n--- DECEMBER 25 (CHRISTMAS FORMULARIES) ---');
  console.log('  ReadingSets Count:', dec25?.readingSets.length, '(Expected: 4)');
  dec25?.readingSets.forEach((s) => console.log(`    Set: ${s.sourceKey} (${s.context}, ${s.readings.length} readings)`));

  // 6. Scripture Text Status
  const unverifiedReadingsCount = await prisma.reading.count({
    where: { textStatus: { not: 'VERIFIED_EXACT' } },
  });
  console.log('\n--- SCRIPTURE AUDIT ---');
  console.log('  Non-VERIFIED_EXACT Readings:', unverifiedReadingsCount, '(Expected: 0)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
