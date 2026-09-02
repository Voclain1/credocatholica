import {
  LiturgicalColor,
  CelebrationRank,
  ReadingType,
  YearCycle,
  WeekdayCycle,
  ReadingSetContext,
  ReadingSetSelectionStatus,
  TextResolutionStatus,
} from '../../../src/generated/prisma/client.js';

export interface SourcePackageMetadata {
  packageName: string;
  sourceName: string;
  sourceType: string;
  sourceUrl?: string;
  sourceVersion: string;
  extractionTimestamp: string;
  periodCovered: {
    start: string;
    end: string;
  };
  scriptureTranslation: string;
  licensingBasis: string;
  reviewerStatus: string;
  packageType?: 'STANDARD_EXPANSION' | 'HISTORICAL_AMENDMENT' | string;
  isHistoricalAmendment?: boolean;
}

export interface SourceCelebrationRecord {
  title: string;
  slug?: string;
  rank: CelebrationRank | string;
  color?: LiturgicalColor | string;
  isMovable?: boolean;
  fixedMonth?: number;
  fixedDay?: number;
  precedenceOrder?: number;
  isOptional?: boolean;
  isCommemoration?: boolean;
  isTransferred?: boolean;
  saintSlug?: string;
  biographySummary?: string;
}

export interface SourceReadingRecord {
  type: ReadingType | string;
  sourceKey?: string;
  readingOrder: number;
  citationRef: string;
  scriptureRef?: string;
  response?: string;
  text: string;
  textStatus?: TextResolutionStatus | string;
  copyrightInfo?: string;
}

export interface SourceReadingSetRecord {
  context: ReadingSetContext | string;
  sourceKey?: string;
  selectionStatus?: ReadingSetSelectionStatus | string;
  label: string;
  description?: string;
  setOrder?: number;
  isCanonicalDefault?: boolean | null;
  sourceUrl: string;
  lectionaryNumber?: string;
  readings: SourceReadingRecord[];
}

export function getReadingSetSourceKey(set: SourceReadingSetRecord): string {
  if (set.sourceKey && set.sourceKey.trim().length > 0) {
    return set.sourceKey.trim();
  }
  return String(set.context);
}

export function getReadingSourceKey(reading: SourceReadingRecord): string {
  if (reading.sourceKey && reading.sourceKey.trim().length > 0) {
    return reading.sourceKey.trim();
  }
  return String(reading.type);
}

export interface ExplicitDeletionInstruction {
  entityType: 'READING_SET' | 'READING';
  sourceKey: string;
  targetDayDate?: string;
  targetSetSourceKey?: string;
  reason: string;
  reviewerNote?: string;
}

export interface SourceDayRecord {
  date: string; // YYYY-MM-DD
  calendarCode?: string; // Default: UNIVERSAL
  seasonCode: string;
  seasonWeek?: number;
  yearCycle: YearCycle | string;
  weekdayCycle: WeekdayCycle | string;
  liturgicalColor: LiturgicalColor | string;
  gloriaRequired: boolean;
  creedRequired: boolean;
  notes?: string;
  celebrations: SourceCelebrationRecord[];
  readingSets?: SourceReadingSetRecord[];
  readings?: SourceReadingRecord[];
  deletions?: ExplicitDeletionInstruction[];
}

export interface SourceIngestionPackage {
  metadata: SourcePackageMetadata & { deletions?: ExplicitDeletionInstruction[] };
  records: SourceDayRecord[];
}

export type ValidationSeverity = 'BLOCKER' | 'WARNING' | 'INFO';

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  date?: string;
  details?: Record<string, unknown>;
}

export type FinalVerdict =
  | 'NOT_READY'
  | 'REQUIRES_REVIEW'
  | 'READY_FOR_HUMAN_APPROVAL'
  | 'APPROVED_FOR_APPLY'
  | 'APPLY_COMPLETE';

export interface PlannedOperation {
  date: string;
  action: 'WOULD_INSERT' | 'WOULD_UPDATE' | 'WOULD_SKIP';
  reason: string;
}

export interface ApprovalManifest {
  packageId: string;
  packageHash: string;
  approvedAt: string;
  reviewer: string;
  status: 'APPROVED_FOR_INGESTION' | 'REJECTED';
  notes?: string;
}

export interface ReconciliationReport {
  packageId: string;
  packageHash: string;
  generatedAt: string;
  metadata: SourcePackageMetadata;
  counts: {
    daysTotal: number;
    celebrationsTotal: number;
    readingSetsTotal: number;
    readingsTotal: number;
    issuesBlockers: number;
    issuesWarnings: number;
  };
  quality: {
    structurallyValid: boolean;
    blockersCount: number;
    warningsCount: number;
    issues: ValidationIssue[];
  };
  operations: PlannedOperation[];
  approval: {
    required: boolean;
    artifactFound: boolean;
    hashMatches: boolean;
    status?: string;
    reviewer?: string;
    approvedAt?: string;
  };
  verdict: FinalVerdict;
  applyResult?: {
    insertedDays: number;
    updatedDays: number;
    insertedCelebrations: number;
    updatedCelebrations: number;
    insertedReadingSets: number;
    updatedReadingSets: number;
    insertedReadings: number;
    updatedReadings: number;
    omittedRetainedSets: number;
    omittedRetainedReadings: number;
    explicitlyDeletedSets: number;
    explicitlyDeletedReadings: number;
    failedDays: number;
  };
}
