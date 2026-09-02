import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { prisma } = await import('../../src/lib/prisma/index.js');

async function main() {
  console.log('--- DATABASE COUNTS ---');
  console.log('LiturgicalSeason:', await prisma.liturgicalSeason.count());
  console.log('LiturgicalDay:', await prisma.liturgicalDay.count());
  console.log('Celebration:', await prisma.celebration.count());
  console.log('ReadingSet:', await prisma.readingSet.count());
  console.log('Reading:', await prisma.reading.count());
  console.log('Saint:', await prisma.saint.count());
  console.log('Prayer:', await prisma.prayer.count());

  const readingSetsByContext = await prisma.readingSet.groupBy({
    by: ['context'],
    _count: true,
  });
  console.log('ReadingSets by Context:', readingSetsByContext);

  const readingSetsByStatus = await prisma.readingSet.groupBy({
    by: ['selectionStatus'],
    _count: true,
  });
  console.log('ReadingSets by SelectionStatus:', readingSetsByStatus);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
