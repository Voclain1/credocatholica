import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { M1_SAINTS } from '../m1-ingestion/src/saints-data.js';
import { M1_PRAYERS } from '../m1-ingestion/src/prayers-data.js';
import { M1_NOVENAS } from '../m1-ingestion/src/novenas-data.js';
import { M1_CATECHISM_ENTRIES, M1_CHURCH_DOCUMENTS } from '../m1-ingestion/src/catechism-documents-data.js';
import { M1_FORMATION_PATHWAYS } from '../m1-ingestion/src/formation-data.js';
import { buildAudit, type ContentText } from './audit.js';

function addFields(output: ContentText[], domain: string, key: string, record: object, fields: string[], claimedSource?: string) {
  const values = record as Record<string, unknown>;
  for (const field of fields) {
    if (typeof values[field] === 'string') output.push({ domain, key, field, text: values[field], claimedSource });
  }
}

function repositoryContent(): ContentText[] {
  const content: ContentText[] = [];
  for (const s of M1_SAINTS) addFields(content, 'saint', s.slug, s, ['biography', 'titleTeaser', 'reviewNote'], s.exactSource);
  for (const p of M1_PRAYERS) addFields(content, 'prayer', p.slug, p, ['bodyText', 'latinText', 'sourceProvenance', 'reviewNote'], p.exactSource);
  for (const n of M1_NOVENAS) {
    addFields(content, 'novena', n.slug, n, ['summary', 'openingPrayer', 'closingPrayer', 'historicalOrigin', 'sourceProvenance', 'reviewNote'], n.exactSource);
    for (const day of n.days) addFields(content, 'novenaDay', `${n.slug}/${day.dayNumber}`, day, ['title', 'intention', 'prayerText', 'reflectionText'], n.exactSource);
  }
  for (const c of M1_CATECHISM_ENTRIES) addFields(content, 'catechism', c.slug, c, ['bodyText', 'councilSource', 'doctrinalLevel'], c.sourceUrl);
  for (const d of M1_CHURCH_DOCUMENTS) addFields(content, 'document', d.slug, d, ['bodyText', 'summary'], d.officialUrl);
  for (const p of M1_FORMATION_PATHWAYS) {
    addFields(content, 'pathway', p.slug, p, ['summary', 'description']);
    for (const m of p.modules) {
      addFields(content, 'module', m.slug, m, ['summary']);
      for (const l of m.lessons) addFields(content, 'lesson', l.slug, l, ['summary', 'bodyText']);
    }
  }
  const directory = resolve('scripts/liturgical-ingestion/input');
  // Historical packages intentionally remain unchanged; findings retain the
  // package name so superseded witnesses are not mistaken for live DB rows.
  for (const filename of readdirSync(directory).filter((f) => f.endsWith('.json'))) {
    const pkg = JSON.parse(readFileSync(resolve(directory, filename), 'utf8'));
    for (const day of pkg.records ?? []) {
      addFields(content, 'liturgicalDay', `${filename}/${day.date}`, day, ['notes'], pkg.metadata?.sourceUrl);
      for (const set of day.readingSets ?? []) {
        for (const r of set.readings ?? []) {
          content.push({ domain: 'reading', key: `${filename}/${day.date}/${set.sourceKey ?? set.context}/${r.sourceKey ?? r.type}`, field: 'text', text: r.text, scriptureRef: r.scriptureRef, claimedSource: set.sourceUrl });
          addFields(content, 'reading', `${filename}/${day.date}/${r.sourceKey ?? r.type}`, r, ['response'], set.sourceUrl);
        }
      }
    }
  }
  return content;
}

async function databaseContent(): Promise<ContentText[]> {
  // Explicit opt-in. A missing URL must never fall back to a local database.
  const { config } = await import('dotenv');
  config({ path: '.env.local', quiet: true });
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for --database. No database was queried.');
  const { prisma } = await import('../../src/lib/prisma/index.js');
  try {
    const result = await prisma.$transaction(async (tx) => {
      // An enforced read-only, consistent snapshot; no content writes.
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
      const content: ContentText[] = [];
      const [saints, prayers, novenas, catechism, documents, pathways, reflections, readings, days] = await Promise.all([
        tx.saint.findMany(), tx.prayer.findMany(), tx.novena.findMany({ include: { days: true } }),
        tx.catechismEntry.findMany(), tx.churchDocument.findMany(),
        tx.formationPathway.findMany({ include: { modules: { include: { lessons: true } } } }),
        tx.reflection.findMany(), tx.reading.findMany(), tx.liturgicalDay.findMany(),
      ]);
      for (const s of saints) addFields(content, 'saint', s.slug, s, ['biography', 'titleTeaser']);
      for (const p of prayers) addFields(content, 'prayer', p.slug, p, ['bodyText', 'latinText']);
      for (const n of novenas) {
        addFields(content, 'novena', n.slug, n, ['summary', 'openingPrayer', 'closingPrayer', 'historicalOrigin']);
        for (const d of n.days) addFields(content, 'novenaDay', `${n.slug}/${d.dayNumber}`, d, ['title', 'intention', 'prayerText', 'reflectionText']);
      }
      for (const c of catechism) addFields(content, 'catechism', c.slug, c, ['bodyText', 'councilSource', 'doctrinalLevel'], c.sourceUrl ?? undefined);
      for (const d of documents) addFields(content, 'document', d.slug, d, ['bodyText', 'summary'], d.officialUrl ?? undefined);
      for (const p of pathways) {
        addFields(content, 'pathway', p.slug, p, ['summary', 'description']);
        for (const m of p.modules) {
          addFields(content, 'module', m.slug, m, ['summary']);
          for (const l of m.lessons) addFields(content, 'lesson', l.slug, l, ['summary', 'bodyText']);
        }
      }
      for (const r of reflections) addFields(content, 'reflection', r.id, r, ['bodyText']);
      for (const r of readings) {
        content.push({ domain: 'reading', key: r.id, field: 'text', text: r.text, scriptureRef: r.scriptureRef });
        addFields(content, 'reading', r.id, r, ['response']);
      }
      for (const d of days) addFields(content, 'liturgicalDay', d.id, d, ['notes']);
      return content;
    }, { isolationLevel: 'RepeatableRead', timeout: 60000 });
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const permitted = new Set(['--database', '--repository', '--output', '--check']);
  for (let i = 0; i < args.length; i++) {
    if (!permitted.has(args[i])) throw new Error(`Unknown argument: ${args[i]}`);
    if (args[i] === '--output') {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('--output requires a file path.');
      i++;
    }
  }
  if (args.includes('--database') && args.includes('--repository')) throw new Error('Choose one audit scope.');
  const records = args.includes('--database') ? await databaseContent() : repositoryContent();
  const report = { coverage: args.includes('--database') ? 'DATABASE_SNAPSHOT' : 'REPOSITORY_INPUTS_NOT_LIVE_DATABASE', ...buildAudit(records) };
  const outputIndex = args.indexOf('--output');
  if (outputIndex >= 0) writeFileSync(resolve(args[outputIndex + 1]), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify(report.summary, null, 2));
  if (args.includes('--check') && report.summary.sourceMismatches + report.summary.unverified > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Content audit failed.');
  process.exitCode = 1;
});
