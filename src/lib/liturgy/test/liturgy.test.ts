import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveApplicationDate } from '../service.js';
import { CelebrationRank, LiturgicalColor, ReadingType } from '../../../generated/prisma/client.js';

test('Liturgy Service — resolveApplicationDate Helper', () => {
  const testDate = new Date('2026-08-28T12:00:00Z');
  const resolved = resolveApplicationDate(testDate);

  assert.equal(resolved.isoDate, '2026-08-28');
  assert.equal(resolved.formattedDisplayDate.includes('2026'), true);
  assert.equal(resolved.timeZoneStrategy.includes('UTC'), true);
});

test('Liturgy Presentation — Reading Ordering Logic', () => {
  const readings = [
    { id: '2', type: ReadingType.RESPONSORIAL_PSALM, readingOrder: 2, citationRef: 'Psalm 23', response: 'The Lord is my shepherd', text: 'The Lord is my shepherd...', copyrightInfo: 'Public Domain' },
    { id: '1', type: ReadingType.FIRST_READING, readingOrder: 1, citationRef: 'Isaiah 7:10-14', text: 'The Lord spoke to Achaz...', copyrightInfo: 'Public Domain' },
    { id: '3', type: ReadingType.GOSPEL, readingOrder: 3, citationRef: 'Matthew 1:18-24', text: 'Now the generation of Christ was in this wise...', copyrightInfo: 'Public Domain' },
  ];

  const sorted = [...readings].sort((a, b) => a.readingOrder - b.readingOrder);

  assert.equal(sorted[0].type, ReadingType.FIRST_READING);
  assert.equal(sorted[1].type, ReadingType.RESPONSORIAL_PSALM);
  assert.equal(sorted[2].type, ReadingType.GOSPEL);
});

test('Liturgy Presentation — Celebration Precedence Categorization', () => {
  const celebrations = [
    { id: 'c2', title: 'St. Augustine', rank: CelebrationRank.MEMORIAL, precedenceOrder: 2, isOptional: true, isCommemoration: false, isTransferred: false },
    { id: 'c1', title: 'Solemnity of St. Joseph', rank: CelebrationRank.SOLEMNITY, precedenceOrder: 1, isOptional: false, isCommemoration: false, isTransferred: false },
  ];

  const principal = celebrations.find((c) => c.precedenceOrder === 1);
  const secondary = celebrations.filter((c) => c.precedenceOrder > 1);

  assert.equal(principal?.title, 'Solemnity of St. Joseph');
  assert.equal(secondary.length, 1);
  assert.equal(secondary[0].title, 'St. Augustine');
});
