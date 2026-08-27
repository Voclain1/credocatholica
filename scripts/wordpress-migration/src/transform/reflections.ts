import { WpPost, ValidationIssue } from '../types.js';
import { sanitizeContent } from '../sanitizer.js';
import { normalizeSlug, normalizeSingleId, PUBLICATION_STATUS_MAP } from '../normalize.js';
import { PublicationStatus } from '../../../../src/generated/prisma/client.js';

export interface TransformedReflection {
  legacyId: number;
  title: string;
  slug: string;
  author: string;
  bodyText: string;
  liturgicalDayId?: number;
  celebrationId?: number;
  readingId?: number;
  saintId?: number;
  publicationStatus: PublicationStatus;
  publishedAt?: Date;
}

export function transformReflection(post: WpPost, issues: ValidationIssue[]): TransformedReflection {
  const acf = post.acf || {};

  const { sanitizedHtml } = sanitizeContent(post.post_content || post.post_title);

  const pubStatus = PUBLICATION_STATUS_MAP[post.post_status.toLowerCase()] || PublicationStatus.DRAFT;

  return {
    legacyId: post.ID,
    title: post.post_title,
    slug: normalizeSlug(post.post_title, post.post_name),
    author: acf.author || 'Editorial Team',
    bodyText: sanitizedHtml || post.post_title,
    liturgicalDayId: normalizeSingleId(acf.linked_liturgical_day) || undefined,
    celebrationId: normalizeSingleId(acf.linked_celebration) || undefined,
    readingId: normalizeSingleId(acf.linked_reading) || undefined,
    saintId: normalizeSingleId(acf.linked_saint) || undefined,
    publicationStatus: pubStatus,
    publishedAt: pubStatus === PublicationStatus.PUBLISHED ? new Date(post.post_date) : undefined,
  };
}
