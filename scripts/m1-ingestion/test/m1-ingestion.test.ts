import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateM1Dataset } from '../src/m1-validator.js';
import { M1_SAINTS, M1SaintRecord } from '../src/saints-data.js';
import { M1_PRAYERS, M1PrayerRecord } from '../src/prayers-data.js';
import { M1_NOVENAS, M1NovenaRecord } from '../src/novenas-data.js';

describe('M1 Saints & Devotional Domain Validation Suite', () => {
  test('1. M1 Dataset - Canonical Invariant Validation (0 Blockers)', () => {
    const report = validateM1Dataset(M1_SAINTS, M1_PRAYERS, M1_NOVENAS);
    assert.strictEqual(report.blockers.length, 0, `Expected 0 blockers, got: ${JSON.stringify(report.blockers, null, 2)}`);
    assert.strictEqual(report.summary.totalSaints, 36);
    assert.strictEqual(report.summary.totalPrayers, 24);
    assert.strictEqual(report.summary.totalNovenas, 5);
    assert.strictEqual(report.summary.totalNovenaDays, 45);
  });

  test('2. M1 Validator - Detect Duplicate Saint Slugs', () => {
    const duplicateSaints: M1SaintRecord[] = [
      ...M1_SAINTS,
      { ...M1_SAINTS[0] }, // Duplicate
    ];
    const report = validateM1Dataset(duplicateSaints, M1_PRAYERS, M1_NOVENAS);
    assert.strictEqual(report.blockers.some((b) => b.code === 'SAINT_SLUG_COLLISION'), true);
  });

  test('3. M1 Validator - Detect Novena Day Gap / Sequence Failure', () => {
    const brokenNovenas: M1NovenaRecord[] = JSON.parse(JSON.stringify(M1_NOVENAS));
    brokenNovenas[0].days = brokenNovenas[0].days.slice(0, 8); // Only 8 days

    const report = validateM1Dataset(M1_SAINTS, M1_PRAYERS, brokenNovenas);
    assert.strictEqual(report.blockers.some((b) => b.code === 'NOVENA_DAY_GAP'), true);
  });

  test('4. M1 Rights Matrix - Divine Mercy Novena marked REQUIRES_RIGHTS_REVIEW', () => {
    const dmNovena = M1_NOVENAS.find((n) => n.slug === 'divine-mercy-novena');
    assert.ok(dmNovena, 'Divine Mercy Novena must exist');
    assert.strictEqual(dmNovena.rightsStatus, 'REQUIRES_RIGHTS_REVIEW');
  });

  test('5. M1 Rights Matrix - Nicene Creed marked PUBLIC_DOMAIN_CONFIRMED (Challoner Traditional Text)', () => {
    const niceneCreed = M1_PRAYERS.find((p) => p.slug === 'nicene-creed');
    assert.ok(niceneCreed, 'Nicene Creed must exist');
    assert.strictEqual(niceneCreed.rightsStatus, 'PUBLIC_DOMAIN_CONFIRMED');
    assert.strictEqual(niceneCreed.textVersionSelected.includes('Traditional'), true);
  });

  test('6. M1 Provenance Matrix - All 36 Saints have ORIGINAL_SUMMARY_FROM_FACTS', () => {
    for (const saint of M1_SAINTS) {
      assert.strictEqual(saint.biographyType, 'ORIGINAL_SUMMARY_FROM_FACTS');
      assert.ok(saint.exactSource.length > 5, `Saint ${saint.slug} missing exactSource`);
      assert.ok(saint.sourceOrganization.length > 2, `Saint ${saint.slug} missing sourceOrganization`);
    }
  });

  test('7. M1 Rights Matrix - All 24 Prayers have explicit rightsStatus', () => {
    for (const prayer of M1_PRAYERS) {
      assert.ok(prayer.rightsStatus, `Prayer ${prayer.slug} missing rightsStatus`);
      assert.ok(prayer.exactSource, `Prayer ${prayer.slug} missing exactSource`);
      assert.ok(prayer.sourceOrganization, `Prayer ${prayer.slug} missing sourceOrganization`);
    }
  });
});
