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
}

export interface TransformedLiturgicalDayPackage {
  legacyId: number;
  date: Date;
  calendarCode: string;
  seasonCode: string;
  seasonWeek?: number;
  yearCycle: YearCycle;
  weekdayCycle: WeekdayCycle;
  liturgicalColor: LiturgicalColor;
  gloriaRequired: boolean;
  creedRequired: boolean;
  notes?: string;
  sourceFeastName?: string;
  isCelebrationResolved: boolean;
  linkedSaintId?: number;
  readings: TransformedReading[];
}

export function transformReading(post: WpPost, issues: ValidationIssue[]): TransformedLiturgicalDayPackage {
  const acf = post.acf || {};

  const colorParsed = parseEnum(acf.liturgical_colour || 'Green', LITURGICAL_COLOR_MAP);
  if (!colorParsed.result) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_reading',
      field: 'acf.liturgical_colour',
      message: `Unknown color '${acf.liturgical_colour}'. Falling back to GREEN.`,
      severity: 'WARNING',
      category: 'UNKNOWN_ENUM',
    });
  }

  const yearCycleParsed = parseEnum(acf.year_cycle || 'Year A', YEAR_CYCLE_MAP);
  const weekdayCycleParsed = parseEnum(acf.weekday_cycle || 'Year 1', WEEKDAY_CYCLE_MAP);

  const rawDate = acf.liturgical_date || post.post_date;
  const dateObj = new Date(rawDate);

  const readings: TransformedReading[] = [];
  let order = 1;

  // First Reading
  if (acf.first_reading_text && acf.first_reading_text.trim()) {
    readings.push({
      type: ReadingType.FIRST_READING,
      readingOrder: order++,
      citationRef: acf.first_reading_ref || 'First Reading',
      text: acf.first_reading_text,
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
    });
  }

  // Responsorial Psalm
  if (acf.psalm_text && acf.psalm_text.trim()) {
    readings.push({
      type: ReadingType.RESPONSORIAL_PSALM,
      readingOrder: order++,
      citationRef: acf.psalm_ref || 'Responsorial Psalm',
      response: acf.psalm_response || undefined,
      text: acf.psalm_text,
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
    });
  }

  // Second Reading
  if (acf.second_reading_text && acf.second_reading_text.trim()) {
    readings.push({
      type: ReadingType.SECOND_READING,
      readingOrder: order++,
      citationRef: acf.second_reading_ref || 'Second Reading',
      text: acf.second_reading_text,
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
    });
  }

  // Gospel Acclamation
  if (acf.gospel_acclamation_text && acf.gospel_acclamation_text.trim()) {
    readings.push({
      type: ReadingType.GOSPEL_ACCLAMATION,
      readingOrder: order++,
      citationRef: acf.gospel_acclamation_ref || 'Gospel Acclamation',
      text: acf.gospel_acclamation_text,
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
    });
  }

  // Gospel
  if (acf.gospel_text && acf.gospel_text.trim()) {
    readings.push({
      type: ReadingType.GOSPEL,
      readingOrder: order++,
      citationRef: acf.gospel_ref || 'Gospel',
      text: acf.gospel_text,
      copyrightInfo: 'Public Domain — Douay-Rheims Translation',
    });
  }

  // Feast Name Handling: Rule 3 (Do not automatically create Celebration unless explicitly resolved)
  const sourceFeastName = acf.feast_name || undefined;
  if (sourceFeastName) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_reading',
      field: 'acf.feast_name',
      message: `Legacy feast_name '${sourceFeastName}' preserved as source context. Canonical Celebration generation deferred pending explicit mapping.`,
      severity: 'WARNING',
      category: 'DEFERRED_FIELD',
    });
  }

  return {
    legacyId: post.ID,
    date: dateObj,
    calendarCode: 'UNIVERSAL',
    seasonCode: 'ORDINARY_TIME',
    seasonWeek: acf.season_week ? parseInt(String(acf.season_week), 10) : undefined,
    yearCycle: yearCycleParsed.result || YearCycle.YEAR_A,
    weekdayCycle: weekdayCycleParsed.result || WeekdayCycle.YEAR_1,
    liturgicalColor: colorParsed.result || LiturgicalColor.GREEN,
    gloriaRequired: Boolean(acf.gloria_required),
    creedRequired: Boolean(acf.creed_required),
    notes: post.post_content || undefined,
    sourceFeastName,
    isCelebrationResolved: false,
    linkedSaintId: normalizeSingleId(acf.linked_saint) || undefined,
    readings,
  };
}
