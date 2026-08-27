import { WpPost, ValidationIssue } from '../types.js';
import { sanitizeContent } from '../sanitizer.js';
import { normalizeSlug, parseEnum, PUBLICATION_STATUS_MAP, CATECHISM_PILLAR_MAP } from '../normalize.js';
import { CatechismPillar, PublicationStatus } from '../../../../src/generated/prisma/client.js';

export interface TransformedCatechismEntry {
  legacyId: number;
  title: string;
  slug: string;
  paragraphStart: number;
  paragraphEnd: number;
  pillar: CatechismPillar;
  doctrinalLevel?: string;
  magisterialWeight?: string;
  councilSource?: string;
  bodyText: string;
  publicationStatus: PublicationStatus;
  publishedAt?: Date;
}

export function transformCatechismEntry(post: WpPost, issues: ValidationIssue[]): TransformedCatechismEntry {
  const acf = post.acf || {};

  const { sanitizedHtml } = sanitizeContent(post.post_content || post.post_title);

  const pillarParsed = parseEnum(acf.pillar || 'Part 1: Profession of Faith', CATECHISM_PILLAR_MAP);
  if (!pillarParsed.result) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_catechism',
      field: 'acf.pillar',
      message: `Unknown Catechism pillar '${acf.pillar}'. Falling back to PART_1_PROFESSION_OF_FAITH.`,
      severity: 'WARNING',
      category: 'UNKNOWN_ENUM',
    });
  }

  const pStart = parseInt(String(acf.paragraph_start || 1), 10);
  const pEnd = parseInt(String(acf.paragraph_end || pStart), 10);
  if (pEnd < pStart) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_catechism',
      field: 'acf.paragraph_end',
      message: `Paragraph end (${pEnd}) is less than start (${pStart}). Correcting to ${pStart}.`,
      severity: 'WARNING',
      category: 'INVALID_DATE',
    });
  }

  const pubStatus = PUBLICATION_STATUS_MAP[post.post_status.toLowerCase()] || PublicationStatus.DRAFT;

  return {
    legacyId: post.ID,
    title: post.post_title,
    slug: normalizeSlug(post.post_title, post.post_name),
    paragraphStart: pStart,
    paragraphEnd: Math.max(pStart, pEnd),
    pillar: pillarParsed.result || CatechismPillar.PART_1_PROFESSION_OF_FAITH,
    doctrinalLevel: acf.doctrinal_level || undefined,
    magisterialWeight: acf.magisterial_weight || undefined,
    councilSource: acf.council_source || undefined,
    bodyText: sanitizedHtml || post.post_title,
    publicationStatus: pubStatus,
    publishedAt: pubStatus === PublicationStatus.PUBLISHED ? new Date(post.post_date) : undefined,
  };
}
