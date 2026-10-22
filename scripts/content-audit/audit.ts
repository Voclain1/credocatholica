import { resolveScripture, sha256, SCRIPTURE_SOURCE_SHA256, SCRIPTURE_SOURCE_URL } from './scripture-source.js';

export interface ContentText {
  domain: string;
  key: string;
  field: string;
  text: string;
  scriptureRef?: string | null;
  claimedSource?: string | null;
}

export interface TextFinding {
  domain: string;
  key: string;
  field: string;
  sha256: string;
  status: 'SOURCE_MATCH' | 'SOURCE_MISMATCH' | 'UNVERIFIED';
  flags: string[];
  claimedSource?: string | null;
  evidence?: {
    sourceUrl: string;
    sourceSha256: string;
    reference: string;
    sourceText: string;
    sourceTextSha256: string;
    currentText: string;
    firstDifference: number | null;
  };
}

export function auditText(record: ContentText): TextFinding {
  const finding: TextFinding = {
    domain: record.domain, key: record.key, field: record.field,
    sha256: sha256(record.text), status: 'UNVERIFIED', flags: [],
    claimedSource: record.claimedSource,
  };
  if (!record.text.trim()) finding.flags.push('EMPTY_TEXT');
  if (/shaped by specific social and religious dynamics|From early life, divine grace prepared/i.test(record.text)) {
    finding.flags.push('SAINT_BIOGRAPHY_TEMPLATE');
  }
  if (/Who hast commanded us to pray without ceasing/i.test(record.text)) finding.flags.push('NOVENA_TEMPLATE');
  if (/has been reviewed according to|Checked for alignment|verified miracles and heroic sanctity/i.test(record.text)) {
    finding.flags.push('REVIEW_OR_MIRACLE_CLAIM_REQUIRES_EVIDENCE');
  }
  if (/principal celebration null/i.test(record.text)) finding.flags.push('INTERNAL_METADATA_IN_COPY');
  if (/\b(?:Divinum Illud Munus|Divinum illud munus)\s*\(1895\)/.test(record.text)) finding.flags.push('INCORRECT_ENCYCLICAL_DATE');
  if (record.domain === 'reading' && record.field === 'text') {
    // citationRef may use modern/lectionary numbering. It must never silently
    // replace the separate Douay-Rheims scriptureRef.
    if (!record.scriptureRef) {
      finding.flags.push('MISSING_DOUAY_RHEIMS_REFERENCE');
      return finding;
    }
    const resolved = resolveScripture(record.scriptureRef);
    if (resolved.status !== 'RESOLVED') {
      finding.flags.push(resolved.reason);
      return finding;
    }
    const exact = record.text === resolved.text;
    finding.status = exact ? 'SOURCE_MATCH' : 'SOURCE_MISMATCH';
    let firstDifference: number | null = null;
    if (!exact) {
      firstDifference = 0;
      while (firstDifference < Math.min(record.text.length, resolved.text.length) && record.text[firstDifference] === resolved.text[firstDifference]) firstDifference++;
    }
    finding.evidence = {
      sourceUrl: SCRIPTURE_SOURCE_URL, sourceSha256: SCRIPTURE_SOURCE_SHA256,
      reference: record.scriptureRef, sourceText: resolved.text,
      sourceTextSha256: sha256(resolved.text), currentText: record.text, firstDifference,
    };
    if (!exact) finding.flags.push('STORED_TEXT_DIFFERS_FROM_PINNED_SOURCE');
  }
  return finding;
}

export function buildAudit(records: ContentText[]) {
  const findings = records.map(auditText);
  const groups = new Map<string, TextFinding[]>();
  for (const finding of findings) {
    const group = groups.get(finding.sha256) ?? [];
    group.push(finding);
    groups.set(finding.sha256, group);
  }
  const duplicates = [...groups.values()].filter((g) => g.length > 1).map((g) =>
    g.map(({ domain, key, field }) => ({ domain, key, field })),
  );
  return {
    generatedAt: new Date().toISOString(),
    scope: 'Text fidelity only. Source matches do not certify reading selection, versification, calendar correctness, doctrinal review, or reproduction rights.',
    normalization: 'Source physical verse line wrapping is unwrapped. Stored text is compared exactly, without punctuation, spelling, case, or whitespace normalization.',
    summary: {
      textFields: findings.length,
      sourceMatches: findings.filter((f) => f.status === 'SOURCE_MATCH').length,
      sourceMismatches: findings.filter((f) => f.status === 'SOURCE_MISMATCH').length,
      unverified: findings.filter((f) => f.status === 'UNVERIFIED').length,
      duplicateGroups: duplicates.length,
    },
    findings, duplicates,
  };
}
