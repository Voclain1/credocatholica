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

test('Liturgy Service — getLiturgicalDayByDate Database Payload Query', async () => {
  const { getLiturgicalDayByDate } = await import('../service.js');

  // Test 1: Simple Weekday (2026-08-31)
  const weekdayResult = await getLiturgicalDayByDate(new Date('2026-08-31T00:00:00Z'));
  assert.equal(weekdayResult.status, 'FOUND');
  if (weekdayResult.status === 'FOUND') {
    assert.equal(weekdayResult.data.season.code, 'ORDINARY_TIME');
    assert.equal(weekdayResult.data.principalCelebration, null);
    assert.equal(weekdayResult.data.secondaryCelebrations.length, 0);
    assert.equal(weekdayResult.data.readingSets.length, 1);
    assert.equal(weekdayResult.data.hasMultipleSets, false);
    assert.equal(weekdayResult.data.hasUncontestedDefault, true);
  }

  // Test 2: August 29 Memorial with Two Reading Alternatives
  const aug29Result = await getLiturgicalDayByDate(new Date('2026-08-29T00:00:00Z'));
  assert.equal(aug29Result.status, 'FOUND');
  if (aug29Result.status === 'FOUND') {
    assert.notEqual(aug29Result.data.principalCelebration, null);
    assert.equal(aug29Result.data.principalCelebration?.title, 'The Beheading of Saint John the Baptist');
    assert.equal(aug29Result.data.principalCelebration?.rank, CelebrationRank.MEMORIAL);
    assert.equal(aug29Result.data.readingSets.length, 2);
    assert.equal(aug29Result.data.hasMultipleSets, true);
    assert.equal(aug29Result.data.hasUncontestedDefault, false);
  }

  // Test 3: August 30 Sunday (No Solemnity Row, Season ORDINARY_TIME)
  const sundayResult = await getLiturgicalDayByDate(new Date('2026-08-30T00:00:00Z'));
  assert.equal(sundayResult.status, 'FOUND');
  if (sundayResult.status === 'FOUND') {
    assert.equal(sundayResult.data.season.code, 'ORDINARY_TIME');
    assert.equal(sundayResult.data.yearCycle, 'YEAR_A');
    assert.equal(sundayResult.data.principalCelebration, null);
    assert.equal(sundayResult.data.secondaryCelebrations.length, 0);
    assert.equal(sundayResult.data.readingSets.length, 1);
    assert.equal(sundayResult.data.readingSets[0].context, 'SUNDAY');
  }
});

