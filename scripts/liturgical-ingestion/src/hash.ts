import crypto from 'node:crypto';
import fs from 'node:fs';
import { SourceIngestionPackage } from './types.js';

/**
 * Computes a deterministic SHA-256 hash of a file on disk.
 */
export function computeFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Computes a deterministic SHA-256 hash of a SourceIngestionPackage object.
 * Key properties are sorted deterministically to ensure reproducible hashes.
 */
export function computePackageHash(pkg: SourceIngestionPackage): string {
  const canonicalString = JSON.stringify(pkg, (key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce((acc: Record<string, unknown>, k) => {
          acc[k] = value[k];
          return acc;
        }, {});
    }
    return value;
  });

  return crypto.createHash('sha256').update(canonicalString).digest('hex');
}

/**
 * Computes SHA-256 checksum of a Scripture text passage for audit verification.
 */
export function computeTextChecksum(text: string): string {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}
