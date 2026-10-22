import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { planDocumentCorrections } from './metadata-corrections.js';
import { sha256 } from './scripture-source.js';
import type { DocumentType } from '../../src/generated/prisma/client.js';

const MORE_SOURCE = 'https://www.vatican.va/content/john-paul-ii/en/motu_proprio/documents/hf_jp-ii_motu-proprio_20001031_thomas-more.html';

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  let backupPath: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--apply') continue;
    if (args[i] === '--backup' && args[i + 1] && !args[i + 1].startsWith('--')) {
      backupPath = resolve(args[++i]);
      continue;
    }
    throw new Error(`Unknown or incomplete argument: ${args[i]}`);
  }
  if (apply && !backupPath) throw new Error('--apply requires --backup <new-file.json>.');
  config({ path: '.env.local', quiet: true });
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. No database was queried or changed.');
  const { prisma } = await import('../../src/lib/prisma/index.js');
  try {
    const documents = await prisma.churchDocument.findMany({ select: { id: true, slug: true, title: true, documentType: true, officialUrl: true, updatedAt: true } });
    const documentCorrections = planDocumentCorrections(documents);
    const more = await prisma.saint.findUnique({
      where: { slug: 'saint-thomas-more' },
      select: { id: true, name: true, updatedAt: true, patronages: { include: { patronage: true } } },
    });
    const wrongMoreLink = more?.patronages.find((p) => p.patronage.slug === 'universal-church');
    const snapshot = {
      createdAt: new Date().toISOString(),
      scope: 'Confirmed metadata only. No biography, prayer, Scripture, Catechism or document body text is changed.',
      documentCorrections,
      thomasMore: wrongMoreLink ? {
        id: more!.id, name: more!.name, updatedAt: more!.updatedAt,
        removeRelation: wrongMoreLink,
        addPatronage: { name: 'Statesmen and Politicians', slug: 'statesmen-politicians' },
        // Record whether the correct relation pre-existed for precise rollback.
        correctRelationExisted: more!.patronages.some((p) => p.patronage.slug === 'statesmen-politicians'),
        evidence: MORE_SOURCE,
      } : null,
    };
    const snapshotJson = JSON.stringify(snapshot, null, 2) + '\n';
    console.log(JSON.stringify({ mode: apply ? 'APPLY' : 'DRY_RUN', documentCorrections, thomasMore: snapshot.thomasMore, snapshotSha256: sha256(snapshotJson) }, null, 2));
    if (!apply) return;
    // Exclusive creation prevents accidentally replacing the recovery record.
    // Backup must succeed before any database mutation.
    writeFileSync(backupPath!, snapshotJson, { flag: 'wx', mode: 0o600 });
    await prisma.$transaction(async (tx) => {
      for (const correction of documentCorrections) {
        const result = await tx.churchDocument.updateMany({
          where: { id: correction.id, updatedAt: correction.updatedAt, ...correction.before, documentType: correction.before.documentType as DocumentType },
          data: { ...correction.after, documentType: correction.after.documentType as DocumentType },
        });
        if (result.count !== 1) throw new Error(`Concurrent document change: ${correction.slug}. All repairs rolled back.`);
      }
      if (snapshot.thomasMore && more && wrongMoreLink) {
        // Updating the parent with its observed timestamp both checks freshness
        // and obtains a row lock before changing its patronage relationships.
        const locked = await tx.saint.updateMany({ where: { id: more.id, updatedAt: more.updatedAt }, data: { updatedAt: new Date() } });
        if (locked.count !== 1) throw new Error('Concurrent Saint Thomas More change. All repairs rolled back.');
        const patronage = await tx.patronage.upsert({
          where: { slug: 'statesmen-politicians' }, update: {},
          create: { name: 'Statesmen and Politicians', slug: 'statesmen-politicians' },
        });
        await tx.saintPatronage.upsert({
          where: { saintId_patronageId: { saintId: more.id, patronageId: patronage.id } }, update: {},
          create: { saintId: more.id, patronageId: patronage.id },
        });
        const removed = await tx.saintPatronage.deleteMany({ where: { id: wrongMoreLink.id, saintId: more.id, patronageId: wrongMoreLink.patronageId } });
        if (removed.count !== 1) throw new Error('Patronage relationship changed concurrently. All repairs rolled back.');
      }
    }, { isolationLevel: 'Serializable' });
    console.log('Confirmed metadata corrections applied. Original values are retained in the backup.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  // Connection errors may include connection parameters; never echo them.
  if (error instanceof Error && /^(--|Unknown|DATABASE_URL|Concurrent|Patronage relationship)/.test(error.message)) console.error(error.message);
  else console.error('Metadata repair failed. No success is claimed. Inspect the local backup and database migration status.');
  process.exitCode = 1;
});
