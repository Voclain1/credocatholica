import fs from 'fs';
import path from 'path';
import { ReconciliationMetrics } from './types.js';

export function generateReconciliationReport(metrics: ReconciliationMetrics, isDryRun = true): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportsDir = path.resolve(process.cwd(), 'scripts/wordpress-migration/reports');

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const modeLabel = isDryRun ? 'DRY-RUN (Planned Operations)' : 'APPLY MODE (Database Executed)';
  const opInsert = isDryRun ? 'WOULD_INSERT' : 'INSERTED';
  const opUpdate = isDryRun ? 'WOULD_UPDATE' : 'UPDATED';
  const opSkip = isDryRun ? 'WOULD_SKIP' : 'UNCHANGED';

  const verdictBadge =
    metrics.verdict === 'NOT_SAFE_TO_APPLY'
      ? '⛔ NOT_SAFE_TO_APPLY (Blocking Semantic Issues / Collisions Present)'
      : metrics.verdict === 'NO_CANONICAL_POSTS_TO_IMPORT'
      ? 'ℹ️ NO_CANONICAL_POSTS_TO_IMPORT (All Source Posts Excluded by Editorial Review)'
      : metrics.verdict === 'APPLY_AFTER_REVIEW'
      ? '⚠️ APPLY_AFTER_REVIEW (Warnings Present)'
      : '✅ SAFE_TO_APPLY';

  const mdLines: string[] = [
    `# CredoCatholica WordPress Migration Reconciliation Report`,
    ``,
    `**FINAL MIGRATION VERDICT:** ${verdictBadge}  `,
    `**Execution Mode:** ${modeLabel}  `,
    `**Generated At:** ${new Date().toISOString()}  `,
    ``,
    `---`,
    ``,
    `## 1. Source Package Counts`,
    ``,
    `| Source Asset | Count |`,
    `| :--- | :--- |`,
    `| **Posts Loaded** | ${metrics.source.posts} |`,
    `| **PostMeta Loaded** | ${metrics.source.postmeta} |`,
    `| **Terms Loaded** | ${metrics.source.terms} |`,
    `| **Taxonomy Definitions** | ${metrics.source.termTaxonomy} |`,
    `| **Term Relationships** | ${metrics.source.termRelationships} |`,
    `| **Media Attachments** | ${metrics.source.media} |`,
    ``,
    `### Posts Loaded by CPT`,
    ``,
    `| Post Type | Count |`,
    `| :--- | :--- |`,
  ];

  for (const [cpt, count] of Object.entries(metrics.source.byPostType)) {
    mdLines.push(`| \`${cpt}\` | ${count} |`);
  }

  mdLines.push(
    ``,
    `---`,
    ``,
    `## 2. Refined Readiness & Quality Metrics`,
    ``,
    `| Metric | Count | Description |`,
    `| :--- | :---: | :--- |`,
    `| **Source Structurally Valid** | **${metrics.quality.sourceStructurallyValid}** | Source records passing schema JSON parsing |`,
    `| **Excluded By Review** | **${metrics.quality.excludedByReview}** | Source posts explicitly excluded by human editorial review (config/exclusions.json) |`,
    `| **Canonical Content Records From Posts** | **${metrics.planned.canonicalContentRecordsFromPosts}** | Target domain content records produced from WordPress posts |`,
    `| **Canonical Ready** | **${metrics.quality.canonicalReady}** | Records passing all structural & semantic rules, safe for DB apply |`,
    `| **Requires Review** | **${metrics.quality.requiresReview}** | Records with unresolved semantic decisions blocking apply |`,
    `| **Orphaned Relationships** | **${metrics.quality.orphanedRelationships}** | Relationships referencing or originating from excluded records |`,
    `| **Failures** | **${metrics.quality.failures}** | Unrecoverable structural or schema failures |`,
    `| **Deferred Fields / Records** | **${metrics.quality.deferred}** | Source fields/concepts deferred to future migration phases |`,
    `| **LiturgicalDay Collisions** | **${metrics.quality.liturgicalDayCollisions}** | Multiple reading records sharing same date identity |`,
    `| **Missing Reading Texts** | **${metrics.quality.missingReadingTexts}** | Reading references present without text content |`,
    `| **Source Content Reviews** | **${metrics.quality.sourceContentReviews}** | Source content anomalies (e.g. future death years) |`,
    `| **Unknown Enums** | **${metrics.quality.unknownEnums}** | Unmapped source enum strings (no fallback applied) |`,
    `| **Duplicate Slugs** | **${metrics.quality.duplicateSlugs}** | Duplicate slug instances detected per content type |`,
    `| **Sanitized Content Fields** | **${metrics.quality.sanitizedFields}** | HTML fields sanitized for unsafe tags/attributes |`,
    ``,
    `---`,
    ``,
    `## 3. Classification Taxonomies Audit (Seed / Reference Status)`,
    ``,
    `| Classification Taxonomy | Total Defined Terms | Referenced Terms (Post-Exclusion) | Recommended Reference Action |`,
    `| :--- | :---: | :---: | :--- |`,
    `| **Patronages (cc_patronage)** | ${metrics.classificationsAudit.patronages.totalDefined} | ${metrics.classificationsAudit.patronages.referenced} | Seed as canonical reference lookup table |`,
    `| **Vocations (cc_vocation)** | ${metrics.classificationsAudit.vocations.totalDefined} | ${metrics.classificationsAudit.vocations.referenced} | Seed as canonical reference lookup table |`,
    `| **Liturgical Seasons (cc_liturgical_season)** | ${metrics.classificationsAudit.seasons.totalDefined} | ${metrics.classificationsAudit.seasons.referenced} | Seed as canonical reference lookup table |`,
    ``,
    `*Note: Taxonomy term definitions exist in the WordPress source. Since all current source posts were excluded as development/test content, 0 post-term relationships remain active. Taxonomies remain recommended for canonical reference seeding.*`,
    ``,
    `---`,
    ``,
    `## 4. Prayer Type Taxonomies Audit`,
    ``,
    `| Term ID | Slug | Term Name | Relationship Count (Post-Exclusion) | Mapped Canonical PrayerType | Audit Status |`,
    `| :---: | :--- | :--- | :---: | :--- | :---: |`
  );

  for (const pt of metrics.prayerTypeAudit) {
    mdLines.push(
      `| ${pt.termId} | \`${pt.slug}\` | ${pt.name} | ${pt.relationshipCount} | \`${pt.mappedType || 'NONE'}\` | **${pt.status}** |`
    );
  }

  mdLines.push(
    ``,
    `---`,
    ``,
    `## 5. Planned Target Operations (${modeLabel})`,
    ``,
    `| Total ${opInsert} | Total ${opUpdate} | Total ${opSkip} |`,
    `| :---: | :---: | :---: |`,
    `| **${metrics.planned.wouldInsert}** | **${metrics.planned.wouldUpdate}** | **${metrics.planned.wouldSkip}** |`,
    ``,
    `### Operations by Canonical Entity`,
    ``,
    `| Entity Model | ${opInsert} | ${opUpdate} | ${opSkip} |`,
    `| :--- | :---: | :---: | :---: |`
  );

  for (const [model, counts] of Object.entries(metrics.planned.byEntityType)) {
    mdLines.push(`| **${model}** | ${counts.wouldInsert} | ${counts.wouldUpdate} | ${counts.wouldSkip} |`);
  }

  mdLines.push(
    ``,
    `---`,
    ``,
    `## 6. Diagnostics & Validation Issues Log`,
    ``,
    `| Legacy ID | Post Type | Field | Category | Severity | Diagnostic Summary |`,
    `| :---: | :--- | :--- | :--- | :---: | :--- |`
  );

  if (metrics.issues.length === 0) {
    mdLines.push(`| - | - | - | - | - | Zero validation issues reported |`);
  } else {
    for (const issue of metrics.issues) {
      mdLines.push(
        `| ${issue.legacyId} | \`${issue.postType}\` | \`${issue.field}\` | \`${issue.category}\` | **${issue.severity}** | ${issue.message} |`
      );
    }
  }

  const reportMd = mdLines.join('\n');
  const mdPath = path.join(reportsDir, `reconciliation-${timestamp}.md`);
  const jsonPath = path.join(reportsDir, `reconciliation-${timestamp}.json`);

  fs.writeFileSync(mdPath, reportMd, 'utf-8');
  fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2), 'utf-8');

  console.log(`[reconciliation] Reconciliation report generated cleanly:`);
  console.log(`  - Final Verdict: ${verdictBadge}`);
  console.log(`  - Markdown: ${mdPath}`);
  console.log(`  - JSON:     ${jsonPath}`);

  return reportMd;
}
