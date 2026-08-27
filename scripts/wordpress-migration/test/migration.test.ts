import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeContent } from '../src/sanitizer.js';
import {
  normalizeSlug,
  normalizeArrayIds,
  parseEnum,
  PUBLICATION_STATUS_MAP,
  ECCLESIAL_STATUS_MAP,
  LITURGICAL_COLOR_MAP,
  PRAYER_TYPE_MAP,
  HISTORICAL_CONFIDENCE_MAP,
} from '../src/normalize.js';
import { transformSaint } from '../src/transform/saints.js';
import { transformPrayer } from '../src/transform/prayers.js';
import { transformNovena } from '../src/transform/novenas.js';
import { transformReading } from '../src/transform/readings.js';
import { validateSourcePackage } from '../src/validate.js';
import { WpPost, WpSourcePackage } from '../src/types.js';
import { ReadingType, PublicationStatus, EcclesialStatus, LiturgicalColor, PrayerType, HistoricalConfidence } from '../../../src/generated/prisma/client.js';

test('HTML Sanitizer — Text Integrity & Unsafe Tag Removal', () => {
  const safeInput = '<p>Example <strong>prayer</strong> text.</p>';
  const res1 = sanitizeContent(safeInput);
  assert.equal(res1.sanitizedHtml, '<p>Example <strong>prayer</strong> text.</p>');
  assert.equal(res1.textOnly, 'Example prayer text.');
  assert.equal(res1.wasModified, false);

  const scriptInput = '<p>Safe wording. <script>alert("unsafe")</script> More safe wording.</p>';
  const res2 = sanitizeContent(scriptInput);
  assert.equal(res2.sanitizedHtml, '<p>Safe wording.  More safe wording.</p>');
  assert.equal(res2.textOnly, 'Safe wording.  More safe wording.');
  assert.equal(res2.wasModified, true);
  assert.equal(res2.reason, 'unsafe_script_removed');

  const onclickInput = '<a href="https://example.com" onclick="doEvil()">Safe Link</a>';
  const res3 = sanitizeContent(onclickInput);
  assert.equal(res3.sanitizedHtml, '<a href="https://example.com">Safe Link</a>');
  assert.equal(res3.wasModified, true);
  assert.equal(res3.reason, 'event_handler_removed');

  const jsUrlInput = '<a href="javascript:alert(1)">Unsafe Link</a>';
  const res4 = sanitizeContent(jsUrlInput);
  assert.equal(res4.sanitizedHtml, '<a>Unsafe Link</a>');
  assert.equal(res4.wasModified, true);
});

test('Saint Date Preservation — Approximate Textual Dates & Historical Code Mapping', () => {
  const post: WpPost = {
    ID: 101,
    post_type: 'cc_saint',
    post_title: 'St. Test',
    post_name: 'st-test',
    post_content: 'Biography text.',
    post_status: 'publish',
    post_date: '2024-01-01 00:00:00',
    post_modified: '2024-01-01 00:00:00',
    acf: {
      birth_year: 'c. 304',
      death_year: 'late 4th century',
      century: 4,
      ecclesial_status: 'Saint',
      historical_confidence: 'a', // Explicit legacy 'a' mapping test
    },
  };

  const issues: any[] = [];
  const saint = transformSaint(post, issues);

  assert.equal(saint.birthYear, 'c. 304');
  assert.equal(saint.deathYear, 'late 4th century');
  assert.equal(saint.century, 4);
  assert.equal(saint.ecclesialStatus, EcclesialStatus.SAINT);
  assert.equal(saint.historicalConfidence, HistoricalConfidence.HISTORICALLY_DOCUMENTED);
});

test('Enum Parsing & Strict Non-Fallback Behavior', () => {
  const e1 = parseEnum('Saint', ECCLESIAL_STATUS_MAP);
  assert.equal(e1.result, EcclesialStatus.SAINT);

  const e2 = parseEnum('Violet', LITURGICAL_COLOR_MAP);
  assert.equal(e2.result, LiturgicalColor.VIOLET);

  // 'gold' must NOT fallback to GREEN!
  const e3 = parseEnum('gold', LITURGICAL_COLOR_MAP);
  assert.equal(e3.result, undefined);

  // 'feria' must NOT fallback to CelebrationRank!
  const e4 = parseEnum('a', HISTORICAL_CONFIDENCE_MAP);
  assert.equal(e4.result, HistoricalConfidence.HISTORICALLY_DOCUMENTED);
});

test('Readings Normalization & Missing Text Validation', () => {
  const post: WpPost = {
    ID: 401,
    post_type: 'cc_reading',
    post_title: 'Reading Test',
    post_name: 'reading-test',
    post_content: '',
    post_status: 'publish',
    post_date: '2024-01-01 00:00:00',
    post_modified: '2024-01-01 00:00:00',
    acf: {
      liturgical_date: '2024-01-01',
      first_reading_ref: 'Isaiah 7:10-14',
      first_reading_text: 'First reading text content.',
      gospel_ref: 'Luke 1:26-38',
      gospel_text: '', // Text missing test case
    },
  };

  const issues: any[] = [];
  const dayPackage = transformReading(post, issues);

  assert.equal(dayPackage.readings.length, 2);
  assert.equal(dayPackage.readings[0].type, ReadingType.FIRST_READING);
  assert.equal(dayPackage.readings[1].type, ReadingType.GOSPEL);

  const missingTextIssue = issues.find((i) => i.category === 'MISSING_READING_TEXT');
  assert.notEqual(missingTextIssue, undefined);
  assert.equal(missingTextIssue?.field, 'acf.gospel_text');
});

test('Validation Engine — LiturgicalDay Collision Detection', () => {
  const post1: WpPost = {
    ID: 53,
    post_type: 'cc_reading',
    post_title: 'Reading 1',
    post_name: 'reading-1',
    post_content: '',
    post_status: 'publish',
    post_date: '2026-03-26',
    post_modified: '2026-03-26',
    acf: { liturgical_date: '2026-03-26' },
  };

  const post2: WpPost = {
    ID: 57,
    post_type: 'cc_reading',
    post_title: 'Reading 2',
    post_name: 'reading-2',
    post_content: '',
    post_status: 'publish',
    post_date: '2026-03-26',
    post_modified: '2026-03-26',
    acf: { liturgical_date: '2026-03-26' },
  };

  const issues: any[] = [];
  const r1 = transformReading(post1, issues);
  const r2 = transformReading(post2, issues);

  const pkg: WpSourcePackage = {
    posts: [post1, post2],
    postmeta: [],
    terms: [],
    termTaxonomy: [],
    termRelationships: [],
    media: [],
  };

  const validationIssues = validateSourcePackage(pkg, [r1, r2]);
  const collisionIssue = validationIssues.find((i) => i.category === 'LITURGICAL_DAY_COLLISION');
  assert.notEqual(collisionIssue, undefined);
  assert.equal(collisionIssue?.severity, 'REQUIRES_REVIEW');
});
