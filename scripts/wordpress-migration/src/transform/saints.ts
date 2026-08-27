import { WpPost, ValidationIssue } from '../types.js';
import { sanitizeContent } from '../sanitizer.js';
import {
  normalizeSlug,
  parseEnum,
  PUBLICATION_STATUS_MAP,
  ECCLESIAL_STATUS_MAP,
  HISTORICAL_CONFIDENCE_MAP,
} from '../normalize.js';
import { EcclesialStatus, HistoricalConfidence, PublicationStatus } from '../../../../src/generated/prisma/client.js';

export interface TransformedSaint {
  legacyId: number;
  name: string;
  fullName?: string;
  slug: string;
  titleTeaser?: string;
  biography: string;
  birthYear?: string;
  deathYear?: string;
  century?: number;
  feastDateMonth?: number;
  feastDateDay?: number;
  ecclesialStatus?: EcclesialStatus;
  canonizationYear?: string;
  canonizedBy?: string;
  isDoctorOfTheChurch: boolean;
  isMartyr: boolean;
  religiousOrder?: string;
  historicalConfidence?: HistoricalConfidence;
  regionSpecificStatus?: string;
  publicationStatus: PublicationStatus;
  publishedAt?: Date;
  linkedPrayerIds: number[];
  linkedNovenaIds: number[];
  isValidForCanonicalApply: boolean;
}

export function transformSaint(post: WpPost, issues: ValidationIssue[]): TransformedSaint {
  const acf = post.acf || {};
  let isValidForCanonicalApply = true;

  const { sanitizedHtml, wasModified, reason } = sanitizeContent(post.post_content || acf.biography || '');
  if (wasModified) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_saint',
      field: 'biography',
      message: `Markup sanitized: ${reason}`,
      severity: 'WARNING',
      category: 'UNSAFE_HTML',
    });
  }

  const ecclesialRaw = acf.ecclesial_status;
  const ecclesialParsed = ecclesialRaw ? parseEnum(ecclesialRaw, ECCLESIAL_STATUS_MAP) : { result: undefined, rawValue: '' };
  if (ecclesialRaw && !ecclesialParsed.result) {
    isValidForCanonicalApply = false;
    issues.push({
      legacyId: post.ID,
      postType: 'cc_saint',
      field: 'acf.ecclesial_status',
      message: `Unknown ecclesial status '${ecclesialRaw}'. Requires review.`,
      severity: 'REQUIRES_REVIEW',
      category: 'UNKNOWN_ENUM',
    });
  }

  const historicalRaw = acf.historical_confidence;
  const historicalParsed = historicalRaw ? parseEnum(historicalRaw, HISTORICAL_CONFIDENCE_MAP) : { result: undefined, rawValue: '' };
  if (historicalRaw && !historicalParsed.result) {
    isValidForCanonicalApply = false;
    issues.push({
      legacyId: post.ID,
      postType: 'cc_saint',
      field: 'acf.historical_confidence',
      message: `Unknown historical confidence '${historicalRaw}'. Requires review.`,
      severity: 'REQUIRES_REVIEW',
      category: 'UNKNOWN_ENUM',
    });
  }

  // Source Content Review: Rule 8 (Detect unusual/future death years e.g. St. Arinze legacyId 50)
  const dYear = acf.death_year ? String(acf.death_year).trim() : '';
  if (dYear) {
    const numericYear = parseInt(dYear.replace(/\D/g, ''), 10);
    if (!isNaN(numericYear) && numericYear > 2026) {
      issues.push({
        legacyId: post.ID,
        postType: 'cc_saint',
        field: 'death_year',
        message: `SOURCE_CONTENT_REVIEW: Unusual/future historical death year '${dYear}' detected for post '${post.post_title}'.`,
        severity: 'REQUIRES_REVIEW',
        category: 'SOURCE_CONTENT_REVIEW',
      });
    }
  }

  const pubStatus = PUBLICATION_STATUS_MAP[post.post_status.toLowerCase()] || PublicationStatus.DRAFT;

  return {
    legacyId: post.ID,
    name: post.post_title,
    fullName: acf.full_name || undefined,
    slug: normalizeSlug(post.post_title, post.post_name),
    titleTeaser: acf.biography_teaser || post.post_excerpt || undefined,
    biography: sanitizedHtml || post.post_title,
    birthYear: acf.birth_year ? String(acf.birth_year) : undefined,
    deathYear: acf.death_year ? String(acf.death_year) : undefined,
    century: acf.century ? parseInt(String(acf.century), 10) : undefined,
    feastDateMonth: acf.feast_date_month ? parseInt(String(acf.feast_date_month), 10) : undefined,
    feastDateDay: acf.feast_date_day ? parseInt(String(acf.feast_date_day), 10) : undefined,
    ecclesialStatus: ecclesialParsed.result || EcclesialStatus.SAINT,
    canonizationYear: acf.canonization_year ? String(acf.canonization_year) : undefined,
    canonizedBy: acf.canonized_by ? String(acf.canonized_by) : undefined,
    isDoctorOfTheChurch: Boolean(acf.is_doctor_of_church),
    isMartyr: Boolean(acf.is_martyr),
    religiousOrder: acf.religious_order || undefined,
    historicalConfidence: historicalParsed.result || HistoricalConfidence.HISTORICALLY_DOCUMENTED,
    regionSpecificStatus: acf.region_specific_status || undefined,
    publicationStatus: pubStatus,
    publishedAt: pubStatus === PublicationStatus.PUBLISHED ? new Date(post.post_date) : undefined,
    linkedPrayerIds: Array.isArray(acf.linked_prayers) ? acf.linked_prayers : [],
    linkedNovenaIds: Array.isArray(acf.linked_novenas) ? acf.linked_novenas : [],
    isValidForCanonicalApply,
  };
}
