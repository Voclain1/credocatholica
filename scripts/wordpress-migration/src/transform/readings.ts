import { WpPost, ValidationIssue } from '../types.js';
import { parseEnum, LITURGICAL_COLOR_MAP, YEAR_CYCLE_MAP, WEEKDAY_CYCLE_MAP, normalizeSingleId } from '../normalize.js';
import { ReadingType, LiturgicalColor, YearCycle, WeekdayCycle } from '../../../../src/generated/prisma/client.js';

export interface TransformedReading {
  type: ReadingType;
  readingOrder: number;
  citationRef: string;
  response?: string;
  text: string;
  copyrightInfo: string;
  hasMissingText: boolean;
}

export interface TransformedLiturgicalDayPackage {
  legacyId: number;
  date: Date;
  formattedDate: string;
  calendarCode: string;
  seasonCode: string;
  seasonWeek?: number;
  yearCycle: YearCycle;
  weekdayCycle: WeekdayCycle;
  liturgicalColor?: LiturgicalColor;
  gloriaRequired: boolean;
  creedRequired: boolean;
  notes?: string;
  sourceFeastName?: string;
  isCelebrationResolved: boolean;
  linkedSaintId?: number;
  readings: TransformedReading[];
  isValidForCanonicalApply: boolean;
}

export function transformReading(post: WpPost, issues: ValidationIssue[]): TransformedLiturgicalDayPackage {
  const acf = post.acf || {};
  let isValidForCanonicalApply = true;

  // Rule 1: No semantic enum fallback for liturgical_colour!
  const rawColor = acf.liturgical_colour;
  const colorParsed = rawColor ? parseEnum(rawColor, LITURGICAL_COLOR_MAP) : { result: undefined, rawValue: '' };
  if (rawColor && !colorParsed.result) {
    isValidForCanonicalApply = false;
    issues.push({
      legacyId: post.ID,
      postType: 'cc_reading',
      field: 'acf.liturgical_colour',
      message: `Unknown liturgical colour '${rawColor}'. Cannot map to canonical enum without review.`,
      severity: 'REQUIRES_REVIEW',
      category: 'UNKNOWN_ENUM',
    });
  }

  const yearCycleParsed = parseEnum(acf.year_cycle || 'Year A', YEAR_CYCLE_MAP);
  const weekdayCycleParsed = parseEnum(acf.weekday_cycle || 'Year 1', WEEKDAY_CYCLE_MAP);

  const rawDate = acf.liturgical_date || post.post_date;
  const dateObj = new Date(rawDate);
  const formattedDate = dateObj.toISOString().split('T')[0];

  const readings: TransformedReading[] = [];
  let order = 1;

  // Rule 4: Validate missing Scripture text per component
  // 1. First Reading
  if (acf.first_reading_ref && acf.first_reading_ref.trim()) {
    const hasText = Boolean(acf.first_reading_text && acf.first_reading_text.trim());
    if (!hasText) {
      isValidForCanonicalApply = false;
      issues.push({
        legacyId: post.ID,
        postType: 'cc_reading',
        field: 'acf.first_reading_text',
        message: `MISSING_READING_TEXT: FIRST_READING reference ('${acf.first_reading_ref}') present, but text is missing.`,
        severity: 'REQUIRES_REVIEW',
        category: 'MISSING_READING_TEXT',
      });
    }
    readings.push({
      type: ReadingType.FIRST_READING,
      readingOrder: order++,
      citationRef: acf.first_reading_ref,
      text: acf.first_reading_text || '',
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
      hasMissingText: !hasText,
    });
  }

  // 2. Responsorial Psalm
  if (acf.psalm_ref && acf.psalm_ref.trim()) {
    const hasText = Boolean(acf.psalm_text && acf.psalm_text.trim());
    if (!hasText) {
      isValidForCanonicalApply = false;
      issues.push({
        legacyId: post.ID,
        postType: 'cc_reading',
        field: 'acf.psalm_text',
        message: `MISSING_READING_TEXT: RESPONSORIAL_PSALM reference ('${acf.psalm_ref}') present, but text is missing.`,
        severity: 'REQUIRES_REVIEW',
        category: 'MISSING_READING_TEXT',
      });
    }
    readings.push({
      type: ReadingType.RESPONSORIAL_PSALM,
      readingOrder: order++,
      citationRef: acf.psalm_ref,
      response: acf.psalm_response || undefined,
      text: acf.psalm_text || '',
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
      hasMissingText: !hasText,
    });
  }

  // 3. Second Reading
  if (acf.second_reading_ref && acf.second_reading_ref.trim()) {
    const hasText = Boolean(acf.second_reading_text && acf.second_reading_text.trim());
    if (!hasText) {
      isValidForCanonicalApply = false;
      issues.push({
        legacyId: post.ID,
        postType: 'cc_reading',
        field: 'acf.second_reading_text',
        message: `MISSING_READING_TEXT: SECOND_READING reference ('${acf.second_reading_ref}') present, but text is missing.`,
        severity: 'REQUIRES_REVIEW',
        category: 'MISSING_READING_TEXT',
      });
    }
    readings.push({
      type: ReadingType.SECOND_READING,
      readingOrder: order++,
      citationRef: acf.second_reading_ref,
      text: acf.second_reading_text || '',
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
      hasMissingText: !hasText,
    });
  }

  // 4. Gospel Acclamation
  if (acf.gospel_acclamation_ref && acf.gospel_acclamation_ref.trim()) {
    const hasText = Boolean(acf.gospel_acclamation_text && acf.gospel_acclamation_text.trim());
    if (!hasText) {
      isValidForCanonicalApply = false;
      issues.push({
        legacyId: post.ID,
        postType: 'cc_reading',
        field: 'acf.gospel_acclamation_text',
        message: `MISSING_READING_TEXT: GOSPEL_ACCLAMATION reference ('${acf.gospel_acclamation_ref}') present, but text is missing.`,
        severity: 'REQUIRES_REVIEW',
        category: 'MISSING_READING_TEXT',
      });
    }
    readings.push({
      type: ReadingType.GOSPEL_ACCLAMATION,
      readingOrder: order++,
      citationRef: acf.gospel_acclamation_ref,
      text: acf.gospel_acclamation_text || '',
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
      hasMissingText: !hasText,
    });
  }

  // 5. Gospel
  if (acf.gospel_ref && acf.gospel_ref.trim()) {
    const hasText = Boolean(acf.gospel_text && acf.gospel_text.trim());
    if (!hasText) {
      isValidForCanonicalApply = false;
      issues.push({
        legacyId: post.ID,
        postType: 'cc_reading',
        field: 'acf.gospel_text',
        message: `MISSING_READING_TEXT: GOSPEL reference ('${acf.gospel_ref}') present, but text is missing.`,
        severity: 'REQUIRES_REVIEW',
        category: 'MISSING_READING_TEXT',
      });
    }
    readings.push({
      type: ReadingType.GOSPEL,
      readingOrder: order++,
      citationRef: acf.gospel_ref,
      text: acf.gospel_text || '',
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
      hasMissingText: !hasText,
    });
  }

  // Feast Name Handling & Feria Diagnostics (Rule 7)
  const sourceFeastName = acf.feast_name || undefined;
  if (sourceFeastName) {
    if (sourceFeastName.trim().toLowerCase() === 'feria') {
      issues.push({
        legacyId: post.ID,
        postType: 'cc_reading',
        field: 'acf.feast_name',
        message: `FERIA DIAGNOSTIC: Legacy feast_name is 'Feria'. Ferial status is LiturgicalDay context, NOT CelebrationRank. Celebration generation skipped.`,
        severity: 'WARNING',
        category: 'DEFERRED_FIELD',
      });
    } else {
      issues.push({
        legacyId: post.ID,
        postType: 'cc_reading',
        field: 'acf.feast_name',
        message: `Legacy feast_name '${sourceFeastName}' preserved as source context. Canonical Celebration generation deferred pending explicit mapping.`,
        severity: 'WARNING',
        category: 'DEFERRED_FIELD',
      });
    }
  }

  return {
    legacyId: post.ID,
    date: dateObj,
    formattedDate,
    calendarCode: 'UNIVERSAL',
    seasonCode: 'ORDINARY_TIME',
    seasonWeek: acf.season_week ? parseInt(String(acf.season_week), 10) : undefined,
    yearCycle: yearCycleParsed.result || YearCycle.YEAR_A,
    weekdayCycle: weekdayCycleParsed.result || WeekdayCycle.YEAR_1,
    liturgicalColor: colorParsed.result,
    gloriaRequired: Boolean(acf.gloria_required),
    creedRequired: Boolean(acf.creed_required),
    notes: post.post_content || undefined,
    sourceFeastName,
    isCelebrationResolved: false,
    linkedSaintId: normalizeSingleId(acf.linked_saint) || undefined,
    readings,
    isValidForCanonicalApply,
  };
}
