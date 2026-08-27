import { WpPost, ValidationIssue } from '../types.js';
import { sanitizeContent } from '../sanitizer.js';
import { normalizeSlug, normalizeSingleId, PUBLICATION_STATUS_MAP } from '../normalize.js';
import { PublicationStatus } from '../../../../src/generated/prisma/client.js';

export interface TransformedFormationLesson {
  lessonOrder: number;
  title: string;
  slug: string;
  summary: string;
  bodyText: string;
  catechismEntryId?: number;
  churchDocumentId?: number;
}

export interface TransformedFormationModule {
  moduleOrder: number;
  title: string;
  slug: string;
  summary: string;
  lessons: TransformedFormationLesson[];
}

export interface TransformedFormationPathway {
  legacyId: number;
  title: string;
  slug: string;
  summary: string;
  description: string;
  estimatedHours?: number;
  publicationStatus: PublicationStatus;
  publishedAt?: Date;
  modules: TransformedFormationModule[];
}

export function transformFormationPathway(post: WpPost, issues: ValidationIssue[]): TransformedFormationPathway {
  const acf = post.acf || {};

  const { sanitizedHtml: descSanitized } = sanitizeContent(post.post_content || acf.description || post.post_title);

  const pubStatus = PUBLICATION_STATUS_MAP[post.post_status.toLowerCase()] || PublicationStatus.DRAFT;

  const modules: TransformedFormationModule[] = [];
  if (Array.isArray(acf.modules)) {
    for (let i = 0; i < acf.modules.length; i++) {
      const rawMod = acf.modules[i];
      const mOrder = rawMod.module_order || i + 1;

      const lessons: TransformedFormationLesson[] = [];
      if (Array.isArray(rawMod.lessons)) {
        for (let j = 0; j < rawMod.lessons.length; j++) {
          const rawLess = rawMod.lessons[j];
          const lOrder = rawLess.lesson_order || j + 1;
          const { sanitizedHtml: lBody } = sanitizeContent(rawLess.lesson_body || rawLess.title || '');

          lessons.push({
            lessonOrder: lOrder,
            title: rawLess.lesson_title || rawLess.title || `Lesson ${lOrder}`,
            slug: normalizeSlug(rawLess.lesson_title || `lesson-${lOrder}`, rawLess.lesson_slug),
            summary: rawLess.lesson_summary || rawLess.lesson_title || `Summary ${lOrder}`,
            bodyText: lBody || rawLess.lesson_title || `Body ${lOrder}`,
            catechismEntryId: normalizeSingleId(rawLess.linked_catechism) || undefined,
            churchDocumentId: normalizeSingleId(rawLess.linked_document) || undefined,
          });
        }
      }

      modules.push({
        moduleOrder: mOrder,
        title: rawMod.module_title || `Module ${mOrder}`,
        slug: normalizeSlug(rawMod.module_title || `module-${mOrder}`, rawMod.module_slug),
        summary: rawMod.module_summary || rawMod.module_title || `Summary ${mOrder}`,
        lessons,
      });
    }
  }

  return {
    legacyId: post.ID,
    title: post.post_title,
    slug: normalizeSlug(post.post_title, post.post_name),
    summary: acf.summary || post.post_excerpt || post.post_title,
    description: descSanitized,
    estimatedHours: acf.estimated_hours ? parseInt(String(acf.estimated_hours), 10) : undefined,
    publicationStatus: pubStatus,
    publishedAt: pubStatus === PublicationStatus.PUBLISHED ? new Date(post.post_date) : undefined,
    modules,
  };
}
