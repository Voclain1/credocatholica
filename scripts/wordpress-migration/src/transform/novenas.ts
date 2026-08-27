import { WpPost, ValidationIssue } from '../types.js';
import { sanitizeContent } from '../sanitizer.js';
import { normalizeSlug, normalizeSingleId, PUBLICATION_STATUS_MAP } from '../normalize.js';
import { PublicationStatus } from '../../../../src/generated/prisma/client.js';

export interface TransformedNovenaDay {
  dayNumber: number;
  title: string;
  intention: string;
  prayerText: string;
  reflectionText?: string;
}

export interface TransformedNovena {
  legacyId: number;
  title: string;
  slug: string;
  summary: string;
  openingPrayer?: string;
  closingPrayer?: string;
  historicalOrigin?: string;
  isIndulgenced: boolean;
  saintId?: number;
  publicationStatus: PublicationStatus;
  publishedAt?: Date;
  days: TransformedNovenaDay[];
}

export function transformNovena(post: WpPost, issues: ValidationIssue[]): TransformedNovena {
  const acf = post.acf || {};

  const { sanitizedHtml: summarySanitized } = sanitizeContent(acf.summary || post.post_content || post.post_title);
  const { sanitizedHtml: openingSanitized } = sanitizeContent(acf.opening_prayer || '');
  const { sanitizedHtml: closingSanitized } = sanitizeContent(acf.closing_prayer || '');

  const pubStatus = PUBLICATION_STATUS_MAP[post.post_status.toLowerCase()] || PublicationStatus.DRAFT;

  const days: TransformedNovenaDay[] = [];
  if (Array.isArray(acf.novena_days)) {
    for (let i = 0; i < acf.novena_days.length; i++) {
      const rawDay = acf.novena_days[i];
      const dayNum = rawDay.day_number || i + 1;
      const { sanitizedHtml: pText } = sanitizeContent(rawDay.day_prayer || rawDay.prayer_text || '');
      const { sanitizedHtml: rText } = sanitizeContent(rawDay.day_reflection || rawDay.reflection_text || '');

      days.push({
        dayNumber: dayNum,
        title: rawDay.day_title || `Day ${dayNum}`,
        intention: rawDay.intention || `Intention for Day ${dayNum}`,
        prayerText: pText || `Prayer for Day ${dayNum}`,
        reflectionText: rText || undefined,
      });
    }
  }

  return {
    legacyId: post.ID,
    title: post.post_title,
    slug: normalizeSlug(post.post_title, post.post_name),
    summary: summarySanitized,
    openingPrayer: openingSanitized || undefined,
    closingPrayer: closingSanitized || undefined,
    historicalOrigin: acf.historical_origin || undefined,
    isIndulgenced: Boolean(acf.is_indulgenced),
    saintId: normalizeSingleId(acf.linked_saint) || undefined,
    publicationStatus: pubStatus,
    publishedAt: pubStatus === PublicationStatus.PUBLISHED ? new Date(post.post_date) : undefined,
    days,
  };
}
