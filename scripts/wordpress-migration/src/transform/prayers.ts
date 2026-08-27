import { WpPost, ValidationIssue } from '../types.js';
import { sanitizeContent } from '../sanitizer.js';
import {
  normalizeSlug,
  normalizeArrayIds,
  parseEnum,
  PUBLICATION_STATUS_MAP,
  PRAYER_TYPE_MAP,
} from '../normalize.js';
import { PrayerType, PublicationStatus } from '../../../../src/generated/prisma/client.js';

export interface TransformedPrayer {
  legacyId: number;
  title: string;
  latinTitle?: string;
  slug: string;
  bodyText: string;
  latinText?: string;
  prayerType: PrayerType;
  isOfficialFormula: boolean;
  isIndulgenced: boolean;
  seasonalUse?: string;
  sourceDocumentId?: number;
  publicationStatus: PublicationStatus;
  publishedAt?: Date;
  linkedSaintIds: number[];
}

export function transformPrayer(post: WpPost, issues: ValidationIssue[]): TransformedPrayer {
  const acf = post.acf || {};

  const { sanitizedHtml, wasModified, reason } = sanitizeContent(post.post_content || acf.body_text || '');
  if (wasModified) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_prayer',
      field: 'post_content',
      message: `Prayer HTML sanitized: ${reason}`,
      severity: 'WARNING',
      category: 'UNSAFE_HTML',
    });
  }

  const typeParsed = parseEnum(acf.prayer_type || 'Devotional', PRAYER_TYPE_MAP);
  if (!typeParsed.result) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_prayer',
      field: 'acf.prayer_type',
      message: `Unknown prayer type '${acf.prayer_type}'. Falling back to DEVOTIONAL.`,
      severity: 'WARNING',
      category: 'UNKNOWN_ENUM',
    });
  }

  const pubStatus = PUBLICATION_STATUS_MAP[post.post_status.toLowerCase()] || PublicationStatus.DRAFT;

  return {
    legacyId: post.ID,
    title: post.post_title,
    latinTitle: acf.latin_title || undefined,
    slug: normalizeSlug(post.post_title, post.post_name),
    bodyText: sanitizedHtml || post.post_title,
    latinText: acf.latin_text || undefined,
    prayerType: typeParsed.result || PrayerType.DEVOTIONAL,
    isOfficialFormula: Boolean(acf.is_official_formula),
    isIndulgenced: Boolean(acf.is_indulgenced),
    seasonalUse: acf.seasonal_use || undefined,
    sourceDocumentId: acf.source_document_id ? parseInt(String(acf.source_document_id), 10) : undefined,
    publicationStatus: pubStatus,
    publishedAt: pubStatus === PublicationStatus.PUBLISHED ? new Date(post.post_date) : undefined,
    linkedSaintIds: normalizeArrayIds(acf.linked_saints),
  };
}
