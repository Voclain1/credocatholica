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
} from '../src/normalize.js';
import { transformSaint } from '../src/transform/saints.js';
import { transformPrayer } from '../src/transform/prayers.js';
import { transformNovena } from '../src/transform/novenas.js';
import { transformReading } from '../src/transform/readings.js';
import { validateSourcePackage } from '../src/validate.js';
import { WpPost, WpSourcePackage } from '../src/types.js';
import { ReadingType, PublicationStatus, EcclesialStatus, LiturgicalColor, PrayerType } from '../../../src/generated/prisma/client.js';

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

test('Saint Date Preservation — Approximate Textual Dates', () => {
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
      historical_confidence: 'Historically Documented',
    },
  };

  const issues: any[] = [];
  const saint = transformSaint(post, issues);

  assert.equal(saint.birthYear, 'c. 304');
  assert.equal(saint.deathYear, 'late 4th century');
  assert.equal(saint.century, 4);
  assert.equal(saint.ecclesialStatus, EcclesialStatus.SAINT);
});

test('Enum Parsing & Controlled Fallbacks', () => {
  const e1 = parseEnum('Saint', ECCLESIAL_STATUS_MAP);
  assert.equal(e1.result, EcclesialStatus.SAINT);

  const e2 = parseEnum('Violet', LITURGICAL_COLOR_MAP);
  assert.equal(e2.result, LiturgicalColor.VIOLET);

  const e3 = parseEnum('Devotional', PRAYER_TYPE_MAP);
  assert.equal(e3.result, PrayerType.DEVOTIONAL);

  const e4 = parseEnum('InvalidEnumString', PRAYER_TYPE_MAP);
  assert.equal(e4.result, undefined);
});

test('Readings Normalization — Structural Roles', () => {
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
      gospel_text: 'Gospel text content.',
    },
  };

  const issues: any[] = [];
  const dayPackage = transformReading(post, issues);

  assert.equal(dayPackage.readings.length, 2);
  assert.equal(dayPackage.readings[0].type, ReadingType.FIRST_READING);
  assert.equal(dayPackage.readings[0].citationRef, 'Isaiah 7:10-14');
  assert.equal(dayPackage.readings[1].type, ReadingType.GOSPEL);
  assert.equal(dayPackage.readings[1].citationRef, 'Luke 1:26-38');
});

test('Novena Days Repeater Transformation', () => {
  const post: WpPost = {
    ID: 301,
    post_type: 'cc_novena',
    post_title: 'St. Joseph Novena',
    post_name: 'st-joseph-novena',
    post_content: 'Novena overview.',
    post_status: 'publish',
    post_date: '2024-01-01 00:00:00',
    post_modified: '2024-01-01 00:00:00',
    acf: {
      summary: 'Summary text.',
      novena_days: [
        { day_number: 1, day_title: 'Day 1', day_prayer: 'Prayer 1' },
        { day_number: 2, day_title: 'Day 2', day_prayer: 'Prayer 2' },
      ],
    },
  };

  const issues: any[] = [];
  const novena = transformNovena(post, issues);

  assert.equal(novena.days.length, 2);
  assert.equal(novena.days[0].dayNumber, 1);
  assert.equal(novena.days[0].title, 'Day 1');
  assert.equal(novena.days[1].dayNumber, 2);
  assert.equal(novena.days[1].title, 'Day 2');
});

test('Validation Engine — Duplicate Slug Detection', () => {
  const pkg: WpSourcePackage = {
    posts: [
      {
        ID: 1,
        post_type: 'cc_saint',
        post_title: 'Saint Francis',
        post_name: 'st-francis',
        post_content: 'Content 1',
        post_status: 'publish',
        post_date: '2024-01-01',
        post_modified: '2024-01-01',
      },
      {
        ID: 2,
        post_type: 'cc_saint',
        post_title: 'Saint Francis Duplicate',
        post_name: 'st-francis',
        post_content: 'Content 2',
        post_status: 'publish',
        post_date: '2024-01-01',
        post_modified: '2024-01-01',
      },
    ],
    postmeta: [],
    terms: [],
    termTaxonomy: [],
    termRelationships: [],
    media: [],
  };

  const issues = validateSourcePackage(pkg);
  const dupIssue = issues.find((i) => i.category === 'DUPLICATE_SLUG');
  assert.notEqual(dupIssue, undefined);
  assert.equal(dupIssue?.legacyId, 2);
});
