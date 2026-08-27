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
  ecclesialStatus: EcclesialStatus;
  canonizationYear?: string;
  canonizedBy?: string;
  isDoctorOfTheChurch: boolean;
  isMartyr: boolean;
  religiousOrder?: string;
  historicalConfidence: HistoricalConfidence;
  regionSpecificStatus?: string;
  publicationStatus: PublicationStatus;
  publishedAt?: Date;
  linkedPrayerIds: number[];
  linkedNovenaIds: number[];
}

export function transformSaint(post: WpPost, issues: ValidationIssue[]): TransformedSaint {
  const acf = post.acf || {};

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

  const ecclesialParsed = parseEnum(acf.ecclesial_status || 'Saint', ECCLESIAL_STATUS_MAP);
  if (!ecclesialParsed.result) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_saint',
      field: 'acf.ecclesial_status',
      message: `Unknown ecclesial status '${acf.ecclesial_status}'. Falling back to SAINT.`,
      severity: 'WARNING',
      category: 'UNKNOWN_ENUM',
    });
  }

  const historicalParsed = parseEnum(acf.historical_confidence || 'Historically Documented', HISTORICAL_CONFIDENCE_MAP);
  if (!historicalParsed.result) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_saint',
      field: 'acf.historical_confidence',
      message: `Unknown historical confidence '${acf.historical_confidence}'. Falling back to HISTORICALLY_DOCUMENTED.`,
      severity: 'WARNING',
      category: 'UNKNOWN_ENUM',
    });
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
  };
}
