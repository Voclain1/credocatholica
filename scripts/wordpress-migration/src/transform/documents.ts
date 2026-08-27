import { WpPost, ValidationIssue } from '../types.js';
import { sanitizeContent } from '../sanitizer.js';
import { normalizeSlug, parseEnum, PUBLICATION_STATUS_MAP, DOCUMENT_TYPE_MAP } from '../normalize.js';
import { DocumentType, PublicationStatus } from '../../../../src/generated/prisma/client.js';

export interface TransformedChurchDocument {
  legacyId: number;
  title: string;
  latinTitle?: string;
  slug: string;
  documentType: DocumentType;
  promulgationDate?: Date;
  issuingAuthority: string;
  officialUrl?: string;
  summary: string;
  bodyText: string;
  publicationStatus: PublicationStatus;
  publishedAt?: Date;
}

export function transformChurchDocument(post: WpPost, issues: ValidationIssue[]): TransformedChurchDocument {
  const acf = post.acf || {};

  const { sanitizedHtml } = sanitizeContent(post.post_content || post.post_title);
  const { sanitizedHtml: summarySanitized } = sanitizeContent(post.post_excerpt || acf.summary || post.post_title);

  const docParsed = parseEnum(acf.document_type || 'Encyclical', DOCUMENT_TYPE_MAP);
  if (!docParsed.result) {
    issues.push({
      legacyId: post.ID,
      postType: 'cc_document',
      field: 'acf.document_type',
      message: `Unknown document type '${acf.document_type}'. Falling back to ENCYCLICAL.`,
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
    documentType: docParsed.result || DocumentType.ENCYCLICAL,
    promulgationDate: acf.promulgation_date ? new Date(acf.promulgation_date) : undefined,
    issuingAuthority: acf.issuing_authority || 'Holy See',
    officialUrl: acf.official_url || undefined,
    summary: summarySanitized,
    bodyText: sanitizedHtml || post.post_title,
    publicationStatus: pubStatus,
    publishedAt: pubStatus === PublicationStatus.PUBLISHED ? new Date(post.post_date) : undefined,
  };
}
