import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, LiturgicalColor } from '../src/generated/prisma/client.js';

// Safety Gate Check (Correction 7)
const seedEnv = process.env.SEED_ENV;
if (seedEnv !== 'development') {
  console.error(
    `[seed] ABORTED: SEED_ENV must be set to 'development' to execute database seeding.`
  );
  console.error(
    `[seed] Current SEED_ENV: '${seedEnv || 'undefined'}'. Database mutation stopped.`
  );
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(`[seed] ABORTED: DATABASE_URL environment variable is missing.`);
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CANONICAL_SEASONS = [
  {
    code: 'ADVENT',
    name: 'Advent',
    defaultColor: LiturgicalColor.VIOLET,
    summary: 'Season of preparation and expectant hope for the Nativity of the Lord and the Second Coming of Christ.',
  },
  {
    code: 'CHRISTMAS',
    name: 'Christmas',
    defaultColor: LiturgicalColor.WHITE,
    summary: 'Season celebrating the Incarnation, Nativity, and manifestation of Jesus Christ to the world.',
  },
  {
    code: 'ORDINARY_TIME',
    name: 'Ordinary Time',
    defaultColor: LiturgicalColor.GREEN,
    summary: 'Season focusing on the public ministry, teachings, and life of Jesus Christ in its fullness.',
  },
  {
    code: 'LENT',
    name: 'Lent',
    defaultColor: LiturgicalColor.VIOLET,
    summary: 'Season of 40 days of penance, fasting, prayer, and preparation for the Paschal Mystery.',
  },
  {
    code: 'EASTER',
    name: 'Easter',
    defaultColor: LiturgicalColor.WHITE,
    summary: 'Season of 50 days celebrating the glorious Resurrection and Ascension of our Lord, ending at Pentecost.',
  },
];

async function main() {
  console.log(`[seed] Starting canonical reference data seed (Environment: DEVELOPMENT)...`);

  let count = 0;
  for (const season of CANONICAL_SEASONS) {
    await prisma.liturgicalSeason.upsert({
      where: { code: season.code },
      update: {
        name: season.name,
        defaultColor: season.defaultColor,
        summary: season.summary,
      },
      create: {
        code: season.code,
        name: season.name,
        defaultColor: season.defaultColor,
        summary: season.summary,
      },
    });
    count++;
  }

  console.log(`[seed] Successfully seeded ${count} canonical LiturgicalSeason reference entries.`);
}

main()
  .catch((err) => {
    console.error(`[seed] Seed execution error: ${err.message}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
