import { PrismaClient } from '../../../../src/generated/prisma/client.js';

export function checkApplySafetyGates(isApply: boolean): void {
  if (!isApply) {
    throw new Error('Database importer called without explicit --apply flag.');
  }

  const env = process.env.MIGRATION_ENV;
  const label = process.env.MIGRATION_DATABASE_LABEL;

  if (env !== 'development') {
    throw new Error(
      `ABORTING WRITE: MIGRATION_ENV must be set to 'development' (received '${env || 'undefined'}').`
    );
  }

  if (label !== 'credocatholica-development') {
    throw new Error(
      `ABORTING WRITE: MIGRATION_DATABASE_LABEL must be set to 'credocatholica-development' (received '${label || 'undefined'}').`
    );
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('ABORTING WRITE: DATABASE_URL environment variable is missing.');
  }

  console.log('[importer] Database safety gates passed cleanly.');
  console.log(`[importer] Target Environment: ${env}`);
  console.log(`[importer] Target Label: ${label}`);
}

export async function executeTransactionalImport(transformedData: any): Promise<{ inserted: number; updated: number; skipped: number }> {
  checkApplySafetyGates(true);

  const prisma = new PrismaClient({} as any);
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  try {
    console.log('[importer] Beginning transactional import against development database...');

    // Transactional processing of classifications
    await prisma.$transaction(async (tx) => {
      // 1. Patronages
      for (const p of transformedData.classifications.patronages) {
        const existing = await tx.patronage.findUnique({ where: { slug: p.slug } });
        if (existing) {
          await tx.patronage.update({
            where: { slug: p.slug },
            data: { name: p.name, description: p.description },
          });
          updated++;
        } else {
          await tx.patronage.create({
            data: { name: p.name, slug: p.slug, description: p.description },
          });
          inserted++;
        }
      }

      // 2. Vocations
      for (const v of transformedData.classifications.vocations) {
        const existing = await tx.vocation.findUnique({ where: { slug: v.slug } });
        if (existing) {
          await tx.vocation.update({
            where: { slug: v.slug },
            data: { name: v.name, description: v.description },
          });
          updated++;
        } else {
          await tx.vocation.create({
            data: { name: v.name, slug: v.slug, description: v.description },
          });
          inserted++;
        }
      }
    });

    console.log(`[importer] Import transactional execution complete.`);
  } finally {
    await prisma.$disconnect();
  }

  return { inserted, updated, skipped };
}
