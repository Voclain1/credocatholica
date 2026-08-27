import { WpSourcePackage, ValidationIssue } from '../types.js';
import { normalizeSlug } from '../normalize.js';

export interface TransformedClassifications {
  patronages: Array<{ name: string; slug: string; description?: string }>;
  vocations: Array<{ name: string; slug: string; description?: string }>;
  seasons: Array<{ code: string; name: string; defaultColor: any; summary?: string }>;
  pathways: Array<{ title: string; slug: string; summary: string; description: string; estimatedHours?: number }>;
}

export function transformClassifications(
  pkg: WpSourcePackage,
  issues: ValidationIssue[]
): TransformedClassifications {
  const patronages: Array<{ name: string; slug: string; description?: string }> = [];
  const vocations: Array<{ name: string; slug: string; description?: string }> = [];
  const seasons: Array<{ code: string; name: string; defaultColor: any; summary?: string }> = [];
  const pathways: Array<{ title: string; slug: string; summary: string; description: string; estimatedHours?: number }> = [];

  const termMap = new Map<number, { name: string; slug: string }>();
  for (const t of pkg.terms) {
    termMap.set(t.term_id, { name: t.name, slug: t.slug });
  }

  for (const tt of pkg.termTaxonomy) {
    const term = termMap.get(tt.term_id);
    if (!term) continue;

    if (tt.taxonomy === 'cc_patronage') {
      patronages.push({
        name: term.name,
        slug: normalizeSlug(term.name, term.slug),
        description: tt.description,
      });
    } else if (tt.taxonomy === 'cc_vocation') {
      vocations.push({
        name: term.name,
        slug: normalizeSlug(term.name, term.slug),
        description: tt.description,
      });
    } else if (tt.taxonomy === 'cc_liturgical_season') {
      seasons.push({
        code: normalizeSlug(term.name, term.slug).toUpperCase().replace(/-/g, '_'),
        name: term.name,
        defaultColor: 'WHITE',
        summary: tt.description,
      });
    }
  }

  // Formation Pathways from cc_formation
  for (const post of pkg.posts) {
    if (post.post_type === 'cc_formation') {
      pathways.push({
        title: post.post_title,
        slug: normalizeSlug(post.post_title, post.post_name),
        summary: post.acf?.summary || post.post_excerpt || post.post_title,
        description: post.post_content || post.post_title,
        estimatedHours: post.acf?.estimated_hours ? parseInt(post.acf.estimated_hours, 10) : undefined,
      });
    }
  }

  return { patronages, vocations, seasons, pathways };
}
