// ==========================================
// SOURCE WORDPRESS EXPORT INTERFACES
// ==========================================

export interface WpPost {
  ID: number;
  post_type: string;
  post_title: string;
  post_name: string;
  post_content: string;
  post_excerpt?: string;
  post_status: string;
  post_date: string;
  post_modified: string;
  guid?: string;
  featured_media_id?: number;
  acf?: Record<string, any>;
}

export interface WpPostMeta {
  meta_id: number;
  post_id: number;
  meta_key: string;
  meta_value: any;
}

export interface WpTerm {
  term_id: number;
  name: string;
  slug: string;
}

export interface WpTermTaxonomy {
  term_taxonomy_id: number;
  term_id: number;
  taxonomy: string;
  description?: string;
  parent?: number;
  count?: number;
}

export interface WpTermRelationship {
  object_id: number;
  term_taxonomy_id: number;
  term_order?: number;
}

export interface WpMedia {
  attachment_id: number;
  url: string;
  filename: string;
  mime_type: string;
  title?: string;
  caption?: string;
  alt_text?: string;
  width?: number;
  height?: number;
}

export interface WpSourcePackage {
  posts: WpPost[];
  postmeta: WpPostMeta[];
  terms: WpTerm[];
  termTaxonomy: WpTermTaxonomy[];
  termRelationships: WpTermRelationship[];
  media: WpMedia[];
}

export interface ExclusionRule {
  sourceSystem: string;
  legacyObjectType: string;
  legacyObjectId: number;
  reason: string;
  notes?: string;
}

// ==========================================
// VALIDATION & SANITIZATION TYPES
// ==========================================

export type ValidationSeverity = 'WARNING' | 'ERROR' | 'REQUIRES_REVIEW' | 'INFO';

export interface ValidationIssue {
  legacyId: number;
  postType: string;
  field: string;
  message: string;
  severity: ValidationSeverity;
  category:
    | 'DUPLICATE_SLUG'
    | 'UNKNOWN_ENUM'
    | 'UNRESOLVED_RELATIONSHIP'
    | 'INVALID_DATE'
    | 'UNSAFE_HTML'
    | 'UNPUBLISHED_STATUS'
    | 'UNKNOWN_TAXONOMY'
    | 'MALFORMED_REPEATER'
    | 'DEFERRED_FIELD'
    | 'LITURGICAL_DAY_COLLISION'
    | 'MISSING_READING_TEXT'
    | 'SOURCE_CONTENT_REVIEW'
    | 'EXCLUDED_BY_REVIEW'
    | 'ORPHANED_RELATIONSHIP';
}

export interface SanitizationResult {
  sanitizedHtml: string;
  textOnly: string;
  wasModified: boolean;
  reason?: string;
}

export interface PrayerTypeTermAudit {
  termId: number;
  name: string;
  slug: string;
  relationshipCount: number;
  mappedType?: string;
  status: 'MAPPED' | 'REQUIRES_REVIEW';
}

// ==========================================
// RECONCILIATION METRICS
// ==========================================

export type MigrationVerdict = 'SAFE_TO_APPLY' | 'APPLY_AFTER_REVIEW' | 'NOT_SAFE_TO_APPLY' | 'NO_CANONICAL_POSTS_TO_IMPORT';

export interface ReconciliationMetrics {
  verdict: MigrationVerdict;
  source: {
    posts: number;
    postmeta: number;
    terms: number;
    termTaxonomy: number;
    termRelationships: number;
    media: number;
    byPostType: Record<string, number>;
  };
  planned: {
    wouldInsert: number;
    wouldUpdate: number;
    wouldSkip: number;
    canonicalContentRecordsFromPosts: number;
    byEntityType: Record<string, { wouldInsert: number; wouldUpdate: number; wouldSkip: number }>;
  };
  quality: {
    sourceStructurallyValid: number;
    canonicalReady: number;
    excludedByReview: number;
    requiresReview: number;
    failures: number;
    deferred: number;
    unresolvedRelationships: number;
    orphanedRelationships: number;
    unknownEnums: number;
    duplicateSlugs: number;
    sanitizedFields: number;
    liturgicalDayCollisions: number;
    missingReadingTexts: number;
    sourceContentReviews: number;
  };
  classificationsAudit: {
    patronages: { totalDefined: number; referenced: number };
    vocations: { totalDefined: number; referenced: number };
    seasons: { totalDefined: number; referenced: number };
  };
  prayerTypeAudit: PrayerTypeTermAudit[];
  issues: ValidationIssue[];
}
