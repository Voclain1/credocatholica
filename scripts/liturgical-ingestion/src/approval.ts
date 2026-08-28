import fs from 'node:fs';
import path from 'node:path';
import { ApprovalManifest, SourceIngestionPackage } from './types.js';
import { computePackageHash } from './hash.js';

const approvalsDir = path.resolve(process.cwd(), 'scripts/liturgical-ingestion/approvals');

export interface ApprovalVerificationResult {
  artifactFound: boolean;
  hashMatches: boolean;
  manifest?: ApprovalManifest;
  reason: string;
}

/**
 * Searches for and verifies a human approval artifact matching the source package.
 */
export function verifyPackageApproval(
  pkg: SourceIngestionPackage,
  packagePath?: string
): ApprovalVerificationResult {
  const currentHash = computePackageHash(pkg);

  if (!fs.existsSync(approvalsDir)) {
    return {
      artifactFound: false,
      hashMatches: false,
      reason: 'Approvals directory does not exist.',
    };
  }

  const files = fs.readdirSync(approvalsDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const fullPath = path.join(approvalsDir, file);
    try {
      const manifest: ApprovalManifest = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

      if (manifest.packageHash === currentHash) {
        if (manifest.status !== 'APPROVED_FOR_INGESTION') {
          return {
            artifactFound: true,
            hashMatches: true,
            manifest,
            reason: `Approval artifact status is '${manifest.status}', not 'APPROVED_FOR_INGESTION'.`,
          };
        }

        return {
          artifactFound: true,
          hashMatches: true,
          manifest,
          reason: 'Valid matching human approval artifact verified.',
        };
      }
    } catch {
      // Ignore malformed approval files during scan
    }
  }

  return {
    artifactFound: false,
    hashMatches: false,
    reason: `No human approval artifact matching package hash '${currentHash.slice(0, 12)}...' was found.`,
  };
}
