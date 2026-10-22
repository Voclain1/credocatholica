import assert from 'node:assert/strict';
import { test } from 'node:test';
import { auditText, buildAudit } from '../audit.js';
import { loadScriptureIndex, resolveScripture } from '../scripture-source.js';
import { assertExactReadingTexts } from '../exact-reading-gate.js';
import { assertNoPublishedSeedTargets } from '../../m1-ingestion/src/seed-safety.js';
import { correctOfficialDocumentUrl } from '../../../src/lib/content/document-sources.js';
import { cleanLiturgicalNotes } from '../../../src/lib/content/liturgical-copy.js';
import { planDocumentCorrections } from '../metadata-corrections.js';

test('pinned Bible extracts all 73 books and correct representative verse text', () => {
  const index = loadScriptureIndex();
  assert.equal(index.size, 35771);
  assert.equal(index.get('Genesis 1:1'), 'In the beginning God created heaven, and earth.');
  assert.equal(index.get('John 1:1'), 'In the beginning was the Word: and the Word was with God: and the Word was God.');
  assert.ok(index.has('Ecclesiasticus 1:1'));
  assert.ok(index.has('Apocalypse 22:21'));
});

test('source resolution preserves verse sequence across separated ranges and chapters', () => {
  const result = resolveScripture('1 John 1:9-10; 1 John 2:1-2');
  assert.equal(result.status, 'RESOLVED');
  if (result.status !== 'RESOLVED') return;
  assert.deepEqual(result.verses, ['1 John 1:9', '1 John 1:10', '1 John 2:1', '1 John 2:2']);
});

test('partial verses, ambiguous source labels, missing verses and overlaps require review', () => {
  for (const ref of ['Micheas 5:2-4a', 'Psalm 113:1', 'John 99:1', 'Luke 1:1-2, 2']) {
    assert.equal(resolveScripture(ref).status, 'REQUIRES_REVIEW', ref);
  }
});

test('exact source comparison rejects punctuation changes and truncated passages', () => {
  const result = resolveScripture('John 1:1-2');
  assert.equal(result.status, 'RESOLVED');
  if (result.status !== 'RESOLVED') return;
  const record = { domain: 'reading', key: 'test', field: 'text', scriptureRef: 'John 1:1-2', text: result.text };
  assert.equal(auditText(record).status, 'SOURCE_MATCH');
  assert.equal(auditText({ ...record, text: result.text.replace(':', ';') }).status, 'SOURCE_MISMATCH');
  assert.equal(auditText({ ...record, text: result.text.split('. ')[0] + '.' }).status, 'SOURCE_MISMATCH');
  assert.equal(auditText({ ...record, scriptureRef: undefined }).status, 'UNVERIFIED');
});

test('rights/source labels alone cannot certify original wording', () => {
  const result = buildAudit([{ domain: 'prayer', key: 'test', field: 'bodyText', text: 'A modern paraphrase.', claimedSource: 'PUBLIC_DOMAIN_CONFIRMED / Roman Missal' }]);
  assert.equal(result.summary.sourceMatches, 0);
  assert.equal(result.summary.unverified, 1);
});

test('apply gate rejects a false VERIFIED_EXACT claim before any writes', () => {
  const pkg = { records: [{ date: '2026-10-22', readingSets: [{ readings: [{ scriptureRef: 'John 1:1-2', text: 'A summary of the Gospel.', textStatus: 'VERIFIED_EXACT' }] }] }] };
  assert.throws(() => assertExactReadingTexts(pkg), /APPLY ABORTED/);
  const resolved = resolveScripture('John 1:1-2');
  assert.equal(resolved.status, 'RESOLVED');
  if (resolved.status !== 'RESOLVED') return;
  pkg.records[0].readingSets[0].readings[0].text = resolved.text;
  assert.doesNotThrow(() => assertExactReadingTexts(pkg));
});

test('legacy unverified seeds cannot target published records', () => {
  assert.throws(() => assertNoPublishedSeedTargets([{ slug: 'published-prayer' }]), /cannot overwrite published content/);
  assert.doesNotThrow(() => assertNoPublishedSeedTargets([]));
});

test('Vatican URL correction is restricted to the observed official-host path', () => {
  assert.equal(correctOfficialDocumentUrl('https://www.vatican.va/archive/hist_councils/vatican_ii/documents/example.html'), 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/example.html');
  assert.equal(correctOfficialDocumentUrl('https://example.com/archive/hist_councils/vatican_ii/documents/example.html'), 'https://example.com/archive/hist_councils/vatican_ii/documents/example.html');
  assert.equal(correctOfficialDocumentUrl('not a URL'), null);
  assert.equal(correctOfficialDocumentUrl('javascript:alert(1)'), null);
});

test('metadata repair retains before values and cannot relabel an actual Catechism as Fidei Depositum', () => {
  const date = new Date('2026-10-22T12:00:00Z');
  const docs = [
    { id: 'pc', slug: 'patris-corde', title: 'Patris Corde', documentType: 'APOSTOLIC_EXHORTATION', officialUrl: null, updatedAt: date },
    { id: 'ccc', slug: 'catechism-of-the-catholic-church', title: 'Catechism of the Catholic Church', documentType: 'CATECHISM', officialUrl: 'https://www.vatican.va/archive/ENG0015/_INDEX.HTM', updatedAt: date },
  ];
  const plan = planDocumentCorrections(docs);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].before.documentType, 'APOSTOLIC_EXHORTATION');
  assert.equal(plan[0].after.documentType, 'APOSTOLIC_LETTER');
  assert.equal(docs[0].documentType, 'APOSTOLIC_EXHORTATION');
  assert.deepEqual(planDocumentCorrections([{ ...docs[0], ...plan[0].after }]), []);
});

test('known internal diagnostics are removed from notes without rewriting substantive text', () => {
  assert.equal(cleanLiturgicalNotes('Thursday of Ordinary Time. Principal celebration null. 2 alternative reading sets'), 'Thursday of Ordinary Time.');
  assert.equal(cleanLiturgicalNotes('Memorial of Saint John Paul II, Pope.'), 'Memorial of Saint John Paul II, Pope.');
});
