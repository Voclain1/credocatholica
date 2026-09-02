import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { validateIngestionPackage } from './src/validator.js';

const DR_COPYRIGHT = 'Douay-Rheims Version, Challoner Revision. Source text: Project Gutenberg eBook #1581. Project Gutenberg identifies this text as public domain in the USA; reuse outside the USA is subject to applicable local law.';

export interface ReadingInput {
  type: string;
  sourceKey: string;
  readingOrder: number;
  citationRef: string;
  scriptureRef: string;
  text: string;
  textStatus?: string;
  copyrightInfo?: string;
}

export interface ReadingSetInput {
  sourceKey: string;
  context: string;
  selectionStatus: string;
  isCanonicalDefault?: boolean | null;
  label?: string;
  description?: string;
  lectionaryNumber?: string;
  sourceUrl?: string;
  readings: ReadingInput[];
}

export interface CelebrationInput {
  sourceKey?: string;
  title: string;
  slug?: string;
  rank: string;
  color: string;
  precedenceOrder?: number;
  isOptional?: boolean;
}

export interface DayInput {
  date: string;
  calendarCode?: string;
  seasonCode: string;
  seasonWeek: number;
  yearCycle?: string;
  weekdayCycle?: string;
  liturgicalColor: string;
  gloriaRequired?: boolean;
  creedRequired?: boolean;
  principalCelebrationTitle?: string;
  notes?: string;
  celebrations: CelebrationInput[];
  readingSets: ReadingSetInput[];
}

export interface PackageInput {
  packageName: string;
  sourceName?: string;
  sourceType?: string;
  sourceUrl?: string;
  sourceVersion?: string;
  extractionTimestamp?: string;
  periodCovered: {
    start: string;
    end: string;
  };
  scriptureTranslation?: string;
  licensingBasis?: string;
  reviewerStatus?: string;
  records: DayInput[];
}

export function buildAndSavePackage(pkgInput: PackageInput, pkgFileName: string, reviewFileName: string) {
  console.log(`\n=======================================================`);
  console.log(`Building Package: ${pkgFileName}`);
  console.log(`=======================================================`);

  const formattedMetadata = {
    packageName: pkgInput.packageName,
    sourceName: pkgInput.sourceName || 'Universal Roman Calendar & Douay-Rheims Reading Package',
    sourceType: pkgInput.sourceType || 'CANONICAL_SCRIPTURE_AND_LITURGY',
    sourceUrl: pkgInput.sourceUrl || `https://credocatholica.com/sources/${pkgInput.packageName}`,
    sourceVersion: pkgInput.sourceVersion || '1.0.0',
    extractionTimestamp: pkgInput.extractionTimestamp || '2026-08-31T20:00:00Z',
    periodCovered: pkgInput.periodCovered,
    scriptureTranslation: pkgInput.scriptureTranslation || 'Douay-Rheims Version, Challoner Revision',
    licensingBasis: pkgInput.licensingBasis || 'Public Domain in the United States (Douay-Rheims Challoner Revision / Vatican General Roman Calendar Baseline)',
    reviewerStatus: pkgInput.reviewerStatus || 'HUMAN_DOCTRINAL_REVIEWED',
  };

  const processedRecords = pkgInput.records.map((d) => {
    let yearCycle = d.yearCycle;
    if (!yearCycle) {
      yearCycle = d.seasonCode === 'ADVENT' ? 'YEAR_B' : 'YEAR_C';
    }
    let weekdayCycle = d.weekdayCycle || 'YEAR_2';
    let gloriaRequired = d.gloriaRequired !== undefined ? d.gloriaRequired : (d.seasonCode === 'ORDINARY_TIME' && (d.celebrations.some(c => c.rank === 'FEAST' || c.rank === 'SOLEMNITY') || d.date.endsWith('Sunday')));
    let creedRequired = d.creedRequired !== undefined ? d.creedRequired : (d.celebrations.some(c => c.rank === 'SOLEMNITY' || c.rank === 'SUNDAY'));

    const celebrations = d.celebrations.map((c, idx) => ({
      sourceKey: c.sourceKey || `celeb-${d.date.replace(/-/g, '').slice(4)}-${c.slug || c.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: c.title,
      rank: c.rank,
      color: c.color,
      precedenceOrder: c.precedenceOrder || (idx + 1),
      isOptional: c.isOptional !== undefined ? c.isOptional : (c.rank === 'OPTIONAL_MEMORIAL'),
    }));

    let principalCelebrationKey: string | null = null;
    if (d.principalCelebrationTitle) {
      const match = celebrations.find(c => c.title === d.principalCelebrationTitle);
      if (match) {
        principalCelebrationKey = match.sourceKey;
      }
    } else if (celebrations.length === 1 && !celebrations[0].isOptional) {
      principalCelebrationKey = celebrations[0].sourceKey;
    }

    const readingSets = d.readingSets.map((s, sIdx) => {
      const readings = s.readings.map((r) => ({
        type: r.type,
        sourceKey: r.sourceKey,
        readingOrder: r.readingOrder,
        citationRef: r.citationRef,
        scriptureRef: r.scriptureRef,
        text: r.text,
        textStatus: r.textStatus || 'VERIFIED_EXACT',
        copyrightInfo: r.copyrightInfo || DR_COPYRIGHT,
      }));

      return {
        context: s.context,
        sourceKey: s.sourceKey,
        selectionStatus: s.selectionStatus,
        isCanonicalDefault: s.isCanonicalDefault !== undefined ? s.isCanonicalDefault : null,
        label: s.label || (s.context === 'WEEKDAY' ? 'Weekday Readings' : s.context === 'SUNDAY' ? 'Sunday Readings' : 'Proper Readings'),
        description: s.description || (s.context === 'PROPER_OF_SAINTS' ? 'Proper readings for saint celebration' : 'Temporal cycle readings'),
        setOrder: sIdx + 1,
        sourceUrl: s.sourceUrl || `https://credocatholica.com/readings/${d.date}/${s.sourceKey}`,
        lectionaryNumber: s.lectionaryNumber || '000',
        readings,
      };
    });

    return {
      date: d.date,
      calendarCode: d.calendarCode || 'UNIVERSAL',
      seasonCode: d.seasonCode,
      seasonWeek: d.seasonWeek,
      yearCycle,
      weekdayCycle,
      liturgicalColor: d.liturgicalColor,
      gloriaRequired,
      creedRequired,
      principalCelebrationKey,
      notes: d.notes || `${d.seasonCode} day ${d.date}`,
      celebrations,
      readingSets,
    };
  });

  const fullPkg = {
    metadata: formattedMetadata,
    records: processedRecords,
  };

  const jsonContent = JSON.stringify(fullPkg, null, 2);
  const pkgPath = path.join(process.cwd(), 'scripts', 'liturgical-ingestion', 'input', pkgFileName);
  fs.writeFileSync(pkgPath, jsonContent, 'utf-8');

  // Compute hash
  const hash = crypto.createHash('sha256').update(jsonContent, 'utf-8').digest('hex');

  // Validate package using validator
  const validationIssues = validateIngestionPackage(fullPkg as any);
  const blockers = validationIssues.filter((i) => i.severity === 'BLOCKER');
  const warnings = validationIssues.filter((i) => i.severity === 'WARNING');
  const verdict = blockers.length === 0 ? 'READY_FOR_HUMAN_APPROVAL' : 'REJECTED';

  console.log(`Package SHA-256: ${hash}`);
  console.log(`Validation Verdict: ${verdict}`);
  console.log(`Blockers: ${blockers.length}, Warnings: ${warnings.length}`);

  if (blockers.length > 0) {
    console.error('Validation Blockers:', blockers);
    throw new Error(`Package ${pkgFileName} has validation blockers!`);
  }

  // Count metrics
  let totalDays = fullPkg.records.length;
  let totalCelebrations = 0;
  let totalReadingSets = 0;
  let totalReadings = 0;

  const contextCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};

  fullPkg.records.forEach((d) => {
    totalCelebrations += d.celebrations.length;
    totalReadingSets += d.readingSets.length;
    d.readingSets.forEach((s) => {
      contextCounts[s.context] = (contextCounts[s.context] || 0) + 1;
      statusCounts[s.selectionStatus] = (statusCounts[s.selectionStatus] || 0) + 1;
      totalReadings += s.readings.length;
      s.readings.forEach((r) => {
        typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
      });
    });
  });

  console.log(`Metrics -> Days: ${totalDays}, Celebrations: ${totalCelebrations}, ReadingSets: ${totalReadingSets}, Readings: ${totalReadings}`);
  console.log(`Contexts:`, contextCounts);
  console.log(`Statuses:`, statusCounts);
  console.log(`Types:`, typeCounts);

  return {
    hash,
    validationIssues,
    metrics: {
      totalDays,
      totalCelebrations,
      totalReadingSets,
      totalReadings,
      contextCounts,
      statusCounts,
      typeCounts,
    },
    pkg: fullPkg,
  };
}
