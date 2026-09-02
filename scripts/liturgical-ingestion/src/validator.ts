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

const calendarAmendmentsPath = path.join(configDir, 'calendar-amendments.json');
const calendarAmendmentsList: Array<{ datePattern: string; title: string; effectiveYear: number }> =
  fs.existsSync(calendarAmendmentsPath) ? JSON.parse(fs.readFileSync(calendarAmendmentsPath, 'utf-8')) : [];

export interface ReviewedProperTuple {
  saintTitleKeyword: string;
  expectedLectionaryNumber: string;
  expectedFirstReadingBookPrefix?: string;
}

export const REVIEWED_PROPER_TUPLE_REGISTRY: ReviewedProperTuple[] = [
  { saintTitleKeyword: 'Teresa of Calcutta', expectedLectionaryNumber: '635a', expectedFirstReadingBookPrefix: 'Isaiah 58' },
  { saintTitleKeyword: 'Denis', expectedLectionaryNumber: '654', expectedFirstReadingBookPrefix: '2 Corinthians 6' },
  { saintTitleKeyword: 'John Leonardi', expectedLectionaryNumber: '655', expectedFirstReadingBookPrefix: '2 Corinthians 4' },
  { saintTitleKeyword: 'Newman', expectedLectionaryNumber: '655bis', expectedFirstReadingBookPrefix: 'Sirach 39' },
  { saintTitleKeyword: 'Callistus', expectedLectionaryNumber: '656', expectedFirstReadingBookPrefix: '1 Peter 5' },
  { saintTitleKeyword: 'Teresa of Jesus', expectedLectionaryNumber: '657', expectedFirstReadingBookPrefix: 'Romans 8' },
  { saintTitleKeyword: 'Hedwig', expectedLectionaryNumber: '658', expectedFirstReadingBookPrefix: 'Sirach 26' },
  { saintTitleKeyword: 'Margaret Mary', expectedLectionaryNumber: '659', expectedFirstReadingBookPrefix: 'Ephesians 3' },
  { saintTitleKeyword: 'Ignatius of Antioch', expectedLectionaryNumber: '660', expectedFirstReadingBookPrefix: 'Philippians 3' },
  { saintTitleKeyword: 'Brébeuf', expectedLectionaryNumber: '662', expectedFirstReadingBookPrefix: '2 Corinthians 4' },
  { saintTitleKeyword: 'Paul of the Cross', expectedLectionaryNumber: '663', expectedFirstReadingBookPrefix: '1 Corinthians 1' },
  { saintTitleKeyword: 'John Paul II', expectedLectionaryNumber: '663A', expectedFirstReadingBookPrefix: 'Isaiah 52' },
  { saintTitleKeyword: 'Capistrano', expectedLectionaryNumber: '664', expectedFirstReadingBookPrefix: '2 Corinthians 5' },
  { saintTitleKeyword: 'Claret', expectedLectionaryNumber: '665', expectedFirstReadingBookPrefix: 'Isaiah 52' },
  { saintTitleKeyword: 'Simon and Jude', expectedLectionaryNumber: '666', expectedFirstReadingBookPrefix: 'Ephesians 2' },
  { saintTitleKeyword: 'All Saints', expectedLectionaryNumber: '667', expectedFirstReadingBookPrefix: 'Revelation 7' },
  { saintTitleKeyword: 'Martin de Porres', expectedLectionaryNumber: '669', expectedFirstReadingBookPrefix: 'Isaiah 58' },
  { saintTitleKeyword: 'Charles Borromeo', expectedLectionaryNumber: '670', expectedFirstReadingBookPrefix: 'Romans 12' },
  { saintTitleKeyword: 'Leo the Great', expectedLectionaryNumber: '672', expectedFirstReadingBookPrefix: 'Sirach 39' },
  { saintTitleKeyword: 'Martin of Tours', expectedLectionaryNumber: '673', expectedFirstReadingBookPrefix: 'Isaiah 61' },
  { saintTitleKeyword: 'Josaphat', expectedLectionaryNumber: '674', expectedFirstReadingBookPrefix: 'Ephesians 4' },
  { saintTitleKeyword: 'Margaret of Scotland', expectedLectionaryNumber: '676', expectedFirstReadingBookPrefix: 'Isaiah 58' },
  { saintTitleKeyword: 'Gertrude', expectedLectionaryNumber: '677', expectedFirstReadingBookPrefix: 'Ephesians 3' },
  { saintTitleKeyword: 'Elizabeth of Hungary', expectedLectionaryNumber: '678', expectedFirstReadingBookPrefix: '1 John 3' },
  { saintTitleKeyword: 'Presentation of the Blessed Virgin', expectedLectionaryNumber: '680', expectedFirstReadingBookPrefix: 'Zechariah 2' },
  { saintTitleKeyword: 'Dũng-Lạc', expectedLectionaryNumber: '683', expectedFirstReadingBookPrefix: 'Revelation 2' },
  { saintTitleKeyword: 'Catherine of Alexandria', expectedLectionaryNumber: '683A', expectedFirstReadingBookPrefix: '1 Corinthians 1' },
  { saintTitleKeyword: 'Andrew, Apostle', expectedLectionaryNumber: '684', expectedFirstReadingBookPrefix: 'Romans 10' },
  { saintTitleKeyword: 'Francis Xavier', expectedLectionaryNumber: '685', expectedFirstReadingBookPrefix: '1 Corinthians 9' },
  { saintTitleKeyword: 'John Damascene', expectedLectionaryNumber: '686', expectedFirstReadingBookPrefix: '2 Timothy 1' },
  { saintTitleKeyword: 'Ambrose', expectedLectionaryNumber: '688', expectedFirstReadingBookPrefix: 'Ephesians 3' },
  { saintTitleKeyword: 'Immaculate Conception', expectedLectionaryNumber: '689', expectedFirstReadingBookPrefix: 'Genesis 3' },
  { saintTitleKeyword: 'Juan Diego', expectedLectionaryNumber: '689A', expectedFirstReadingBookPrefix: '1 Corinthians 1' },
  { saintTitleKeyword: 'Loreto', expectedLectionaryNumber: '689B', expectedFirstReadingBookPrefix: 'Isaiah 7' },
  { saintTitleKeyword: 'Damasus', expectedLectionaryNumber: '690', expectedFirstReadingBookPrefix: 'Acts 20' },
  { saintTitleKeyword: 'Guadalupe', expectedLectionaryNumber: '690A', expectedFirstReadingBookPrefix: 'Zechariah 2' },
  { saintTitleKeyword: 'John of the Cross', expectedLectionaryNumber: '693', expectedFirstReadingBookPrefix: '1 Corinthians 2' },
  { saintTitleKeyword: 'Stephen', expectedLectionaryNumber: '696', expectedFirstReadingBookPrefix: 'Acts 6' },
  { saintTitleKeyword: 'Holy Innocents', expectedLectionaryNumber: '698', expectedFirstReadingBookPrefix: '1 John 1' },
];

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

    // Validate General Roman Calendar Freshness
    if (day.date && day.celebrations) {
      const year = parseInt(day.date.split('-')[0], 10);
      const mmdd = day.date.substring(5);
      calendarAmendmentsList.forEach((amendment) => {
        if (amendment.datePattern === mmdd && year >= amendment.effectiveYear) {
          const hasCelebration = day.celebrations?.some((c) =>
            c.title.toLowerCase().includes(amendment.title.toLowerCase().split(',')[0])
          );
          if (!hasCelebration) {
            issues.push({
              severity: 'BLOCKER',
              code: 'STALE_CALENDAR_AMENDMENT_OMITTED',
              message: `General Roman Calendar amendment '${amendment.title}' (effective ${amendment.effectiveYear}) is missing on date '${day.date}'. Current-authority calendar freshness required.`,
              date: day.date,
            });
          }
        }
      });
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
    const seenSetKeys = new Set<string>();

    setsToValidate.forEach((rSet, sIdx) => {
      if (!rSet.context) {
        issues.push({
          severity: 'BLOCKER',
          code: 'MISSING_READING_SET_CONTEXT',
          message: `ReadingSet #${sIdx + 1} on date '${day.date}' is missing context.`,
          date: day.date,
        });
      }

      const setKey = rSet.sourceKey || String(rSet.context);
      if (seenSetKeys.has(setKey)) {
        issues.push({
          severity: 'BLOCKER',
          code: 'DUPLICATE_READING_SET_SOURCE_KEY',
          message: `Duplicate ReadingSet sourceKey '${setKey}' on date '${day.date}'.`,
          date: day.date,
        });
      } else {
        seenSetKeys.add(setKey);
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
      const seenReadingKeys = new Set<string>();
      const readings = rSet.readings && Array.isArray(rSet.readings) ? rSet.readings : [];
      const firstReading = readings.find((r) => r.type === 'FIRST_READING');

      // Source-Identity Invariant Audit
      const labelOrKey = `${rSet.label || ''} ${rSet.sourceKey || ''} ${rSet.description || ''}`;
      REVIEWED_PROPER_TUPLE_REGISTRY.forEach((fixture) => {
        const matchesKeyword = labelOrKey.includes(fixture.saintTitleKeyword);
        const matchesLectionary = rSet.lectionaryNumber === fixture.expectedLectionaryNumber;

        if (matchesKeyword && !matchesLectionary) {
          issues.push({
            severity: 'BLOCKER',
            code: 'CROSSED_SOURCE_IDENTITY',
            message: `ReadingSet for '${fixture.saintTitleKeyword}' on date '${day.date}' specifies lectionaryNumber '${rSet.lectionaryNumber}', expected '${fixture.expectedLectionaryNumber}'.`,
            date: day.date,
          });
        }

        if (!matchesKeyword && matchesLectionary && rSet.context === 'PROPER_OF_SAINTS') {
          issues.push({
            severity: 'BLOCKER',
            code: 'CROSSED_SOURCE_IDENTITY',
            message: `Proper ReadingSet with lectionaryNumber '${rSet.lectionaryNumber}' on date '${day.date}' is missing saint keyword '${fixture.saintTitleKeyword}'.`,
            date: day.date,
          });
        }

        if (matchesKeyword && fixture.expectedFirstReadingBookPrefix && firstReading?.citationRef) {
          if (!firstReading.citationRef.startsWith(fixture.expectedFirstReadingBookPrefix)) {
            issues.push({
              severity: 'BLOCKER',
              code: 'CROSSED_SOURCE_IDENTITY',
              message: `ReadingSet for '${fixture.saintTitleKeyword}' on date '${day.date}' has first reading '${firstReading.citationRef}', expected to start with '${fixture.expectedFirstReadingBookPrefix}'.`,
              date: day.date,
            });
          }
        }
      });

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
        const rKey = reading.sourceKey || String(reading.type);

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

        if (seenReadingKeys.has(rKey)) {
          issues.push({
            severity: 'BLOCKER',
            code: 'DUPLICATE_READING_SOURCE_KEY',
            message: `Duplicate reading sourceKey '${rKey}' in set '${rSet.label}' on date '${day.date}'.`,
            date: day.date,
          });
        } else {
          seenReadingKeys.add(rKey);
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

      // Semantic Duplicate Reading & Unreviewed Replacement Check
      const standardTypes = new Set(['FIRST_READING', 'RESPONSORIAL_PSALM', 'SECOND_READING', 'GOSPEL']);
      const seenReadingTypes = new Map<string, { sourceKey: string; citationRef: string }>();

      const pkgDeletions = pkg.metadata.deletions || [];
      const dayDeletions = day.deletions || [];
      const allDeletions = [...pkgDeletions, ...dayDeletions];

      readings.forEach((reading) => {
        const typeKey = String(reading.type);
        if (standardTypes.has(typeKey)) {
          if (seenReadingTypes.has(typeKey)) {
            const prev = seenReadingTypes.get(typeKey)!;
            const isDeleted = allDeletions.some(
              (d) => d.entityType === 'READING' && (d.sourceKey === reading.sourceKey || d.sourceKey === prev.sourceKey)
            );

            if (!isDeleted) {
              if (reading.citationRef !== prev.citationRef) {
                issues.push({
                  severity: 'BLOCKER',
                  code: 'UNREVIEWED_READING_REPLACEMENT',
                  message: `ReadingSet '${rSet.label || rSet.sourceKey || sIdx + 1}' on date '${day.date}' contains conflicting pericopes for type '${reading.type}' ('${reading.citationRef}' vs '${prev.citationRef}') without an explicit reviewed deletion instruction.`,
                  date: day.date,
                });
              } else {
                issues.push({
                  severity: 'BLOCKER',
                  code: 'SEMANTIC_READING_DUPLICATE',
                  message: `ReadingSet '${rSet.label || rSet.sourceKey || sIdx + 1}' on date '${day.date}' contains multiple readings of type '${reading.type}' (${reading.sourceKey} vs ${prev.sourceKey}).`,
                  date: day.date,
                });
              }
            }
          } else {
            seenReadingTypes.set(typeKey, {
              sourceKey: reading.sourceKey || reading.type,
              citationRef: reading.citationRef || '',
            });
          }
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
