import {
  LiturgicalColor,
  CelebrationRank,
  ReadingType,
  YearCycle,
  WeekdayCycle,
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
  readingOrder: number;
  citationRef: string;
  response?: string;
  text: string;
  copyrightInfo?: string;
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
  readings: SourceReadingRecord[];
}

export interface SourceIngestionPackage {
  metadata: SourcePackageMetadata;
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

export interface ReconciliationReport {
  packageId: string;
  packageHash: string;
  generatedAt: string;
  metadata: SourcePackageMetadata;
  counts: {
    daysTotal: number;
    celebrationsTotal: number;
    readingsTotal: number;
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
    insertedReadings: number;
    failedDays: number;
  };
}

export interface ApprovalManifest {
  packageHash: string;
  packageName: string;
  dateRange: {
    start: string;
    end: string;
  };
  status: 'APPROVED_FOR_INGESTION' | 'REJECTED';
  reviewer: string; // Human reviewer identifier (label/initials)
  approvedAt: string;
  reportId?: string;
  notes?: string;
}
