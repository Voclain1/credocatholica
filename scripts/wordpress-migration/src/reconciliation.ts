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

  const mdLines: string[] = [
    `# CredoCatholica WordPress Migration Reconciliation Report`,
    ``,
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
    `## 2. Planned Target Operations (${modeLabel})`,
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
    `## 3. Data Quality & Diagnostic Metrics`,
    ``,
    `| Metric | Count | Description |`,
    `| :--- | :---: | :--- |`,
    `| **Valid** | ${metrics.quality.valid} | Records passing all structural & domain validation checks |`,
    `| **Warnings** | ${metrics.quality.warnings} | Non-blocking issues requiring editorial review |`,
    `| **Failures** | ${metrics.quality.failures} | Severe structural or domain validation errors |`,
    `| **Deferred Fields / Records** | ${metrics.quality.deferred} | Fields/concepts deferred to future migration phases |`,
    `| **Unresolved Relationships** | ${metrics.quality.unresolvedRelationships} | Foreign key targets missing or unresolved |`,
    `| **Unknown Enums** | ${metrics.quality.unknownEnums} | Source enum strings requiring controlled fallback |`,
    `| **Duplicate Slugs** | ${metrics.quality.duplicateSlugs} | Duplicate slug instances detected per content type |`,
    `| **Sanitized Content Fields** | ${metrics.quality.sanitizedFields} | HTML fields sanitized for unsafe tags/scripts |`,
    ``,
    `---`,
    ``,
    `## 4. Diagnostics Log (Sanitization & Validation Summaries)`,
    ``,
    `| Legacy ID | Post Type | Field | Category | Severity | Diagnostic Summary |`,
    `| :---: | :--- | :--- | :--- | :---: | :--- |`
  );

  if (metrics.issues.length === 0) {
    mdLines.push(`| - | - | - | - | - | Zero validation issues reported |`);
  } else {
    for (const issue of metrics.issues) {
      mdLines.push(
        `| ${issue.legacyId} | \`${issue.postType}\` | \`${issue.field}\` | \`${issue.category}\` | ${issue.severity} | ${issue.message} |`
      );
    }
  }

  const reportMd = mdLines.join('\n');
  const mdPath = path.join(reportsDir, `reconciliation-${timestamp}.md`);
  const jsonPath = path.join(reportsDir, `reconciliation-${timestamp}.json`);

  fs.writeFileSync(mdPath, reportMd, 'utf-8');
  fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2), 'utf-8');

  console.log(`[reconciliation] Reconciliation report generated cleanly:`);
  console.log(`  - Markdown: ${mdPath}`);
  console.log(`  - JSON:     ${jsonPath}`);

  return reportMd;
}
