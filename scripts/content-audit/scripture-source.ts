import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const SCRIPTURE_SOURCE_URL = 'https://www.gutenberg.org/cache/epub/1581/pg1581.txt';
export const SCRIPTURE_SOURCE_SHA256 = '7d10da78d8ec97db53b4e2bd8719cc01e16106b44937a673ba34aa534a04c007';

// These are the book names/numbering in the pinned Douay-Rheims source,
// not the modern numbering of the books of Samuel/Kings or of the Psalms.
const BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Josue', 'Judges', 'Ruth',
  '1 Kings', '2 Kings', '3 Kings', '4 Kings', '1 Paralipomenon', '2 Paralipomenon',
  '1 Esdras', 'Nehemias', 'Tobias', 'Judith', 'Esther', 'Job', 'Psalm', 'Proverbs',
  'Ecclesiastes', 'Canticle of Canticles', 'Wisdom', 'Ecclesiasticus', 'Isaias',
  'Jeremias', 'Lamentations', 'Baruch', 'Ezechiel', 'Daniel', 'Osee', 'Joel', 'Amos',
  'Abdias', 'Jonas', 'Micheas', 'Nahum', 'Habacuc', 'Sophonias', 'Aggeus', 'Zacharias',
  'Malachias', '1 Machabees', '2 Machabees', 'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
  'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Apocalypse',
] as const;

const ALIASES: Record<string, string> = {
  Isaiah: 'Isaias', Jeremiah: 'Jeremias', Ezekiel: 'Ezechiel', Micah: 'Micheas',
  Zechariah: 'Zacharias', Zephaniah: 'Sophonias', Revelation: 'Apocalypse',
  Psalms: 'Psalm', Sirach: 'Ecclesiasticus', Joshua: 'Josue',
};

export type ScriptureIndex = Map<string, string | null>;
export type ScriptureResolution =
  | { status: 'RESOLVED'; text: string; verses: string[]; sourceUrl: string; sourceSha256: string }
  | { status: 'REQUIRES_REVIEW'; reason: string };

export function sha256(text: string | Buffer): string {
  return createHash('sha256').update(text).digest('hex');
}

let cachedIndex: ScriptureIndex | undefined;

export function loadScriptureIndex(): ScriptureIndex {
  if (cachedIndex) return cachedIndex;
  const raw = gunzipSync(readFileSync(fileURLToPath(new URL('./sources/douay-rheims-1581.txt.gz', import.meta.url))));
  if (sha256(raw) !== SCRIPTURE_SOURCE_SHA256) {
    throw new Error('The pinned Scripture source has changed; source verification is required.');
  }
  const source = raw.toString('utf8').replace(/\r\n/g, '\n');
  const start = source.indexOf('*** START OF THE PROJECT GUTENBERG EBOOK');
  const end = source.indexOf('*** END OF THE PROJECT GUTENBERG EBOOK');
  if (start < 0 || end < start) throw new Error('Missing source boundaries.');
  const index: ScriptureIndex = new Map();
  let bookIndex = -1;
  for (const paragraph of source.slice(start, end).split(/\n\s*\n/)) {
    const match = paragraph.trim().match(/^(\d+):(\d+)\. ([\s\S]+)$/);
    if (!match) continue;
    if (match[1] === '1' && match[2] === '1') bookIndex++;
    if (bookIndex >= BOOKS.length) throw new Error('Unexpected additional book in source.');
    if (bookIndex < 0) throw new Error('Verse before first book.');
    const key = `${BOOKS[bookIndex]} ${match[1]}:${match[2]}`;
    // The Gutenberg witness repeats some Psalm 113 verse labels. Do not
    // silently choose one occurrence or renumber the source.
    if (index.has(key)) {
      index.set(key, null);
      continue;
    }
    // Only physical line wrapping is removed. Apostrophes, punctuation,
    // spelling and every word are retained from the source snapshot.
    index.set(key, match[3].replace(/\n/g, ' '));
  }
  if (bookIndex !== BOOKS.length - 1 || index.size < 30000) {
    throw new Error('Incomplete Scripture extraction; refusing to certify text.');
  }
  cachedIndex = index;
  return index;
}

/** Resolve only explicit, whole-verse Douay-Rheims references. Never infer subverses. */
export function resolveScripture(reference: string, index = loadScriptureIndex()): ScriptureResolution {
  if (!reference.trim()) return { status: 'REQUIRES_REVIEW', reason: 'Missing Douay-Rheims scriptureRef.' };
  let book = '';
  const verses: string[] = [];
  const texts: string[] = [];
  for (const section of reference.split(';')) {
    const match = section.trim().match(/^(?:(.+?)\s+)?(\d+):([\d,\s-]+)$/);
    if (!match) return { status: 'REQUIRES_REVIEW', reason: `Unsupported or partial-verse reference: ${section.trim()}` };
    if (match[1]) book = ALIASES[match[1]] ?? match[1];
    if (!book) return { status: 'REQUIRES_REVIEW', reason: 'Missing book name.' };
    const chapter = Number(match[2]);
    for (const range of match[3].split(',')) {
      const limits = range.trim().match(/^(\d+)(?:-(\d+))?$/);
      if (!limits) return { status: 'REQUIRES_REVIEW', reason: `Unsupported verse range: ${range}` };
      const first = Number(limits[1]);
      const last = limits[2] ? Number(limits[2]) : first;
      if (first < 1 || last < first || last - first > 176) {
        return { status: 'REQUIRES_REVIEW', reason: `Invalid verse range: ${range}` };
      }
      for (let verse = first; verse <= last; verse++) {
        const key = `${book} ${chapter}:${verse}`;
        const text = index.get(key);
        if (text === null) return { status: 'REQUIRES_REVIEW', reason: `Ambiguous duplicate verse label in source: ${key}` };
        if (text === undefined) return { status: 'REQUIRES_REVIEW', reason: `Source verse not found: ${key}` };
        if (verses.includes(key)) return { status: 'REQUIRES_REVIEW', reason: `Overlapping verse selection: ${key}` };
        verses.push(key);
        texts.push(text);
      }
    }
  }
  return { status: 'RESOLVED', text: texts.join(' '), verses, sourceUrl: SCRIPTURE_SOURCE_URL, sourceSha256: SCRIPTURE_SOURCE_SHA256 };
}
