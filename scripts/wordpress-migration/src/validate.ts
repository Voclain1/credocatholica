import { WpSourcePackage, ValidationIssue } from './types.js';
import { PUBLICATION_STATUS_MAP } from './normalize.js';
import { TransformedLiturgicalDayPackage } from './transform/readings.js';

export function validateSourcePackage(
  pkg: WpSourcePackage,
  transformedReadings: TransformedLiturgicalDayPackage[] = []
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const slugTracker: Record<string, Set<string>> = {};

  for (const post of pkg.posts) {
    const postType = post.post_type;
    const slug = post.post_name || post.post_title.toLowerCase().replace(/[^a-z0-9-]+/g, '-');

    // 1. Slug uniqueness per content type
    if (!slugTracker[postType]) {
      slugTracker[postType] = new Set();
    }
    if (slugTracker[postType].has(slug)) {
      issues.push({
        legacyId: post.ID,
        postType,
        field: 'post_name',
        message: `Duplicate slug '${slug}' detected for post_type '${postType}'.`,
        severity: 'WARNING',
        category: 'DUPLICATE_SLUG',
      });
    } else {
      slugTracker[postType].add(slug);
    }

    // 2. Publication Status Check
    const statusResult = PUBLICATION_STATUS_MAP[post.post_status.toLowerCase()];
    if (!statusResult) {
      issues.push({
        legacyId: post.ID,
        postType,
        field: 'post_status',
        message: `Unmapped or conservative status '${post.post_status}'. Will be deferred or skipped from published output.`,
        severity: 'WARNING',
        category: 'UNPUBLISHED_STATUS',
      });
    }

    // 3. Novena Days Repeater Validation
    if (postType === 'cc_novena' && post.acf?.novena_days) {
      const days = post.acf.novena_days;
      if (Array.isArray(days)) {
        const seenDays = new Set<number>();
        for (const day of days) {
          if (seenDays.has(day.day_number)) {
            issues.push({
              legacyId: post.ID,
              postType,
              field: 'acf.novena_days',
              message: `Duplicate Novena Day number ${day.day_number} in novena post ${post.ID}.`,
              severity: 'WARNING',
              category: 'MALFORMED_REPEATER',
            });
          } else {
            seenDays.add(day.day_number);
          }
        }
      }
    }
  }

  // 4. Unknown Taxonomy Validation
  for (const tt of pkg.termTaxonomy) {
    const knownTaxonomies = [
      'cc_patronage',
      'cc_vocation',
      'cc_liturgical_season',
      'cc_feast_rank',
      'cc_prayer_type',
      'cc_ccc_pillar',
      'cc_pathway',
      'cc_century',
    ];
    if (!knownTaxonomies.includes(tt.taxonomy)) {
      issues.push({
        legacyId: tt.term_taxonomy_id,
        postType: 'taxonomy',
        field: 'taxonomy',
        message: `Unknown taxonomy '${tt.taxonomy}' term ID ${tt.term_id}.`,
        severity: 'WARNING',
        category: 'UNKNOWN_TAXONOMY',
      });
    }
  }

  // 5. LiturgicalDay Identity Collision Validation (Rule 3)
  const dateGroups = new Map<string, TransformedLiturgicalDayPackage[]>();
  for (const rPkg of transformedReadings) {
    const key = `${rPkg.calendarCode}:${rPkg.formattedDate}`;
    if (!dateGroups.has(key)) {
      dateGroups.set(key, []);
    }
    dateGroups.get(key)!.push(rPkg);
  }

  for (const [key, group] of dateGroups.entries()) {
    if (group.length > 1) {
      const [cal, dt] = key.split(':');
      const legacyIds = group.map((g) => g.legacyId);

      for (const rPkg of group) {
        issues.push({
          legacyId: rPkg.legacyId,
          postType: 'cc_reading',
          field: 'liturgical_date',
          message: `LITURGICAL_DAY_COLLISION: Multiple legacy reading records (IDs: [${legacyIds.join(', ')}]) map to same LiturgicalDay identity (calendarCode: ${cal}, date: ${dt}). Duplicate LiturgicalDay creation blocked.`,
          severity: 'REQUIRES_REVIEW',
          category: 'LITURGICAL_DAY_COLLISION',
        });
      }
    }
  }

  return issues;
}
