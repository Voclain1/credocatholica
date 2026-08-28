import fs from 'node:fs';
import path from 'node:path';
import {
  SourceIngestionPackage,
  ValidationIssue,
  SourceDayRecord,
} from './types.js';
import { sanitizeScriptureText } from './normalizer.js';

// Load curated mapping configs
const configDir = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/config');

function loadConfig(filename: string): Record<string, string> {
  const filePath = path.join(configDir, filename);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

const seasonsMap = loadConfig('seasons.json');
const colorsMap = loadConfig('colors.json');
const ranksMap = loadConfig('ranks.json');
const cyclesMap = loadConfig('cycles.json');

export function validateIngestionPackage(pkg: SourceIngestionPackage): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Source Contract Validation
  if (!pkg.metadata) {
    issues.push({
      severity: 'BLOCKER',
      code: 'MISSING_METADATA',
      message: 'Ingestion package metadata is missing.',
    });
    return issues;
  }

  if (!pkg.metadata.packageName || !pkg.metadata.sourceName) {
    issues.push({
      severity: 'BLOCKER',
      code: 'INVALID_METADATA',
      message: 'Ingestion package packageName or sourceName is missing.',
    });
  }

  if (!pkg.metadata.scriptureTranslation || !pkg.metadata.scriptureTranslation.startsWith('Douay-Rheims')) {
    issues.push({
      severity: 'BLOCKER',
      code: 'UNAPPROVED_TRANSLATION',
      message: `Scripture translation '${pkg.metadata.scriptureTranslation}' is not approved. Must be a approved Douay-Rheims translation.`,
    });
  }

  if (!pkg.records || !Array.isArray(pkg.records) || pkg.records.length === 0) {
    issues.push({
      severity: 'BLOCKER',
      code: 'EMPTY_RECORDS',
      message: 'Ingestion package contains zero records.',
    });
    return issues;
  }

  // Track date collisions within package
  const seenDates = new Set<string>();

  // 2. Per-Day Structural & Liturgical Validation
  pkg.records.forEach((day: SourceDayRecord, index: number) => {
    const dayContext = day.date || `Record #${index + 1}`;

    if (!day.date || !/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
      issues.push({
        severity: 'BLOCKER',
        code: 'INVALID_DATE_FORMAT',
        message: `Date '${day.date}' is missing or malformed (must be YYYY-MM-DD).`,
        date: dayContext,
      });
    }

    const calendarCode = day.calendarCode || 'UNIVERSAL';
    const dayKey = `${calendarCode}:${day.date}`;
    if (seenDates.has(dayKey)) {
      issues.push({
        severity: 'BLOCKER',
        code: 'DUPLICATE_DAY_IN_PACKAGE',
        message: `Package contains duplicate record for calendar '${calendarCode}' on date '${day.date}'.`,
        date: day.date,
      });
    } else {
      seenDates.add(dayKey);
    }

    // Validate Liturgical Season
    if (!day.seasonCode || !seasonsMap[day.seasonCode]) {
      issues.push({
        severity: 'BLOCKER',
        code: 'UNKNOWN_SEASON',
        message: `Season '${day.seasonCode}' is unknown or not mapped to a canonical season code.`,
        date: day.date,
      });
    }

    // Validate Liturgical Color
    if (!day.liturgicalColor || !colorsMap[day.liturgicalColor]) {
      issues.push({
        severity: 'BLOCKER',
        code: 'UNKNOWN_COLOR',
        message: `Liturgical color '${day.liturgicalColor}' is unknown or not mapped to a canonical color.`,
        date: day.date,
      });
    }

    // Validate Cycles
    if (!day.yearCycle || !cyclesMap[day.yearCycle]) {
      issues.push({
        severity: 'BLOCKER',
        code: 'UNKNOWN_YEAR_CYCLE',
        message: `Year cycle '${day.yearCycle}' is invalid or unmapped.`,
        date: day.date,
      });
    }

    if (!day.weekdayCycle || !cyclesMap[day.weekdayCycle]) {
      issues.push({
        severity: 'BLOCKER',
        code: 'UNKNOWN_WEEKDAY_CYCLE',
        message: `Weekday cycle '${day.weekdayCycle}' is invalid or unmapped.`,
        date: day.date,
      });
    }

    // 3. Celebration Validation
    if (day.celebrations && Array.isArray(day.celebrations)) {
      let principalCount = 0;

      day.celebrations.forEach((cel, celIdx) => {
        if (!cel.title || cel.title.trim() === '') {
          issues.push({
            severity: 'BLOCKER',
            code: 'MISSING_CELEBRATION_TITLE',
            message: `Celebration #${celIdx + 1} on date '${day.date}' is missing a title.`,
            date: day.date,
          });
        }

        if (!cel.rank || !ranksMap[cel.rank]) {
          issues.push({
            severity: 'BLOCKER',
            code: 'UNKNOWN_RANK',
            message: `Celebration '${cel.title}' has unknown rank '${cel.rank}'.`,
            date: day.date,
          });
        }

        if (cel.color && !colorsMap[cel.color]) {
          issues.push({
            severity: 'BLOCKER',
            code: 'UNKNOWN_COLOR',
            message: `Celebration '${cel.title}' has unknown color '${cel.color}'.`,
            date: day.date,
          });
        }

        const precedence = cel.precedenceOrder ?? 1;
        if (precedence === 1) {
          principalCount++;
        }
      });

      if (principalCount > 1) {
        issues.push({
          severity: 'WARNING',
          code: 'MULTIPLE_PRINCIPAL_CELEBRATIONS',
          message: `Date '${day.date}' specifies ${principalCount} celebrations with precedenceOrder = 1. Conventional fallback will pick the first.`,
          date: day.date,
        });
      }
    }

    // 4. Reading Sets & Reading Validation
    const setsToValidate = day.readingSets && Array.isArray(day.readingSets) ? day.readingSets : [];

    // Legacy fallback wrapper if readingSets is absent but readings is present
    if (setsToValidate.length === 0 && day.readings && Array.isArray(day.readings)) {
      setsToValidate.push({
        context: 'WEEKDAY',
        selectionStatus: 'SOLE_SET',
        label: 'Default Readings',
        sourceUrl: 'https://credocatholica.com/legacy-ingestion',
        readings: day.readings,
      });
    }

    let defaultSetCount = 0;

    setsToValidate.forEach((rSet, sIdx) => {
      if (!rSet.context) {
        issues.push({
          severity: 'BLOCKER',
          code: 'MISSING_READING_SET_CONTEXT',
          message: `ReadingSet #${sIdx + 1} on date '${day.date}' is missing context.`,
          date: day.date,
        });
      }

      if (rSet.isCanonicalDefault === true) {
        defaultSetCount++;
      }

      if (!rSet.sourceUrl || rSet.sourceUrl.trim() === '') {
        issues.push({
          severity: 'BLOCKER',
          code: 'MISSING_READING_SET_SOURCE_URL',
          message: `ReadingSet '${rSet.label || sIdx + 1}' on date '${day.date}' is missing sourceUrl.`,
          date: day.date,
        });
      }

      const seenReadingOrders = new Set<number>();
      const readings = rSet.readings && Array.isArray(rSet.readings) ? rSet.readings : [];

      if (readings.length === 0) {
        issues.push({
          severity: 'WARNING',
          code: 'EMPTY_READING_SET',
          message: `ReadingSet '${rSet.label || sIdx + 1}' on date '${day.date}' contains 0 readings.`,
          date: day.date,
        });
      }

      readings.forEach((reading, rIdx) => {
        const rOrder = reading.readingOrder ?? (rIdx + 1);

        if (seenReadingOrders.has(rOrder)) {
          issues.push({
            severity: 'BLOCKER',
            code: 'DUPLICATE_READING_ORDER',
            message: `Duplicate readingOrder ${rOrder} in set '${rSet.label}' on date '${day.date}'.`,
            date: day.date,
          });
        } else {
          seenReadingOrders.add(rOrder);
        }

        if (!reading.citationRef || reading.citationRef.trim() === '') {
          issues.push({
            severity: 'BLOCKER',
            code: 'MISSING_CITATION_REF',
            message: `Reading #${rOrder} in set '${rSet.label}' on date '${day.date}' is missing a citation reference.`,
            date: day.date,
          });
        }

        if (!reading.text || reading.text.trim() === '') {
          issues.push({
            severity: 'BLOCKER',
            code: 'MISSING_READING_TEXT',
            message: `Reading '${reading.citationRef || rOrder}' on date '${day.date}' is missing text content.`,
            date: day.date,
          });
        } else {
          const sanitized = sanitizeScriptureText(reading.text);
          if (!sanitized) {
            issues.push({
              severity: 'BLOCKER',
              code: 'SANITIZATION_EMPTY_TEXT',
              message: `Reading '${reading.citationRef}' text became empty after HTML sanitization.`,
              date: day.date,
            });
          }
        }

        if (reading.textStatus === 'REQUIRES_MANUAL_SEGMENT_REVIEW') {
          issues.push({
            severity: 'WARNING',
            code: 'REQUIRES_MANUAL_SEGMENT_REVIEW',
            message: `Reading '${reading.citationRef}' on date '${day.date}' text requires manual sub-verse segment review.`,
            date: day.date,
          });
        }

        // Responsorial Psalm Refrain check
        if (reading.type === 'RESPONSORIAL_PSALM' && (!reading.response || reading.response.trim() === '')) {
          issues.push({
            severity: 'INFO',
            code: 'MISSING_PSALM_RESPONSE',
            message: `Responsorial Psalm '${reading.citationRef}' on date '${day.date}' does not supply an explicit refrain response.`,
            date: day.date,
          });
        }
      });
    });

    if (defaultSetCount > 1) {
      issues.push({
        severity: 'BLOCKER',
        code: 'MULTIPLE_CANONICAL_DEFAULTS',
        message: `Date '${day.date}' specifies ${defaultSetCount} sets with isCanonicalDefault: true. At most 1 canonical default is allowed.`,
        date: day.date,
      });
    }
  });

  return issues;
}
