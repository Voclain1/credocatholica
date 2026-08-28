import fs from 'node:fs';
import path from 'node:path';
import {
  SourceIngestionPackage,
  ValidationIssue,
  ReconciliationReport,
  PlannedOperation,
  FinalVerdict,
} from './types.js';
import { computePackageHash } from './hash.js';
import { verifyPackageApproval } from './approval.js';

const reportsDir = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/reports');

export function generateReconciliationReport(
  pkg: SourceIngestionPackage,
  issues: ValidationIssue[],
  existingDaysDates: Set<string> = new Set()
): ReconciliationReport {
  const packageHash = computePackageHash(pkg);
  const generatedAt = new Date().toISOString();

  const blockers = issues.filter((i) => i.severity === 'BLOCKER');
  const warnings = issues.filter((i) => i.severity === 'WARNING');
  const structurallyValid = blockers.length === 0;

  // Calculate planned operations
  const operations: PlannedOperation[] = pkg.records.map((r) => {
    const exists = existingDaysDates.has(r.date);
    return {
      date: r.date,
      action: exists ? 'WOULD_UPDATE' : 'WOULD_INSERT',
      reason: exists
        ? 'LiturgicalDay record already exists in database; would update approved fields.'
        : 'New canonical LiturgicalDay record; would insert.',
    };
  });

  // Count totals
  let celebrationsTotal = 0;
  let readingsTotal = 0;
  pkg.records.forEach((r) => {
    celebrationsTotal += r.celebrations ? r.celebrations.length : 0;
    readingsTotal += r.readings ? r.readings.length : 0;
  });

  // Verify human approval artifact
  const approvalCheck = verifyPackageApproval(pkg);

  // Determine final verdict
  let verdict: FinalVerdict = 'NOT_READY';
  if (!structurallyValid) {
    verdict = 'NOT_READY';
  } else if (warnings.length > 0 && !approvalCheck.hashMatches) {
    verdict = 'REQUIRES_REVIEW';
  } else if (!approvalCheck.hashMatches) {
    verdict = 'READY_FOR_HUMAN_APPROVAL';
  } else if (approvalCheck.hashMatches && approvalCheck.manifest?.status === 'APPROVED_FOR_INGESTION') {
    verdict = 'APPROVED_FOR_APPLY';
  }

  const report: ReconciliationReport = {
    packageId: pkg.metadata.packageName,
    packageHash,
    generatedAt,
    metadata: pkg.metadata,
    counts: {
      daysTotal: pkg.records.length,
      celebrationsTotal,
      readingsTotal,
    },
    quality: {
      structurallyValid,
      blockersCount: blockers.length,
      warningsCount: warnings.length,
      issues,
    },
    operations,
    approval: {
      required: true,
      artifactFound: approvalCheck.artifactFound,
      hashMatches: approvalCheck.hashMatches,
      status: approvalCheck.manifest?.status,
      reviewer: approvalCheck.manifest?.reviewer,
      approvedAt: approvalCheck.manifest?.approvedAt,
    },
    verdict,
  };

  return report;
}

export function writeReportFiles(report: ReconciliationReport): { jsonPath: string; mdPath: string } {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = `ingestion-report-${timestamp}`;
  const jsonPath = path.join(reportsDir, `${baseName}.json`);
  const mdPath = path.join(reportsDir, `${baseName}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

  // Format Markdown report
  const mdLines: string[] = [
    `# Liturgical Ingestion Reconciliation Report`,
    ``,
    `**Package Name:** ${report.packageId}`,
    `**Package SHA-256:** \`${report.packageHash}\``,
    `**Generated At:** ${report.generatedAt}`,
    `**Verdict:** \`${report.verdict}\``,
    ``,
    `---`,
    ``,
    `## 1. Source Package Metadata`,
    `- **Source Name:** ${report.metadata.sourceName}`,
    `- **Source Type:** ${report.metadata.sourceType}`,
    `- **Scripture Translation:** ${report.metadata.scriptureTranslation}`,
    `- **Licensing Basis:** ${report.metadata.licensingBasis}`,
    `- **Date Range:** ${report.metadata.periodCovered?.start} to ${report.metadata.periodCovered?.end}`,
    ``,
    `## 2. Summary Counts`,
    `- **Liturgical Days:** ${report.counts.daysTotal}`,
    `- **Celebrations:** ${report.counts.celebrationsTotal}`,
    `- **Readings:** ${report.counts.readingsTotal}`,
    ``,
    `## 3. Quality & Validation Summary`,
    `- **Structurally Valid:** ${report.quality.structurallyValid ? 'YES' : 'NO'}`,
    `- **Blockers Count:** ${report.quality.blockersCount}`,
    `- **Warnings Count:** ${report.quality.warningsCount}`,
    ``,
    `### Issues & Flags:`,
  ];

  if (report.quality.issues.length === 0) {
    mdLines.push(`*No validation issues detected.*`);
  } else {
    report.quality.issues.forEach((issue) => {
      mdLines.push(`- [${issue.severity}] \`${issue.code}\`: ${issue.message}${issue.date ? ` (Date: ${issue.date})` : ''}`);
    });
  }

  mdLines.push(
    ``,
    `## 4. Human Approval Verification`,
    `- **Artifact Found:** ${report.approval.artifactFound ? 'YES' : 'NO'}`,
    `- **Hash Matches Package:** ${report.approval.hashMatches ? 'YES' : 'NO'}`,
    `- **Approval Status:** ${report.approval.status || 'N/A'}`,
    `- **Reviewer:** ${report.approval.reviewer || 'N/A'}`,
    `- **Approved At:** ${report.approval.approvedAt || 'N/A'}`,
    ``,
    `## 5. Planned Operations`,
  );

  report.operations.forEach((op) => {
    mdLines.push(`- Date \`${op.date}\`: \`${op.action}\` — ${op.reason}`);
  });

  fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf-8');

  return { jsonPath, mdPath };
}
