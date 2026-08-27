import fs from 'fs';
import path from 'path';
import { WpSourcePackage, WpPost, WpPostMeta, WpTerm, WpTermTaxonomy, WpTermRelationship, WpMedia, ExclusionRule } from './types.js';

export function loadSourcePackage(useFixtures = false): WpSourcePackage {
  const baseDir = path.resolve(
    process.cwd(),
    'scripts/wordpress-migration',
    useFixtures ? 'fixtures' : 'input'
  );

  const readJson = <T>(filePath: string, defaultVal: T): T => {
    if (!fs.existsSync(filePath)) {
      return defaultVal;
    }
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[loader] Warning: Could not parse ${filePath}: ${(err as Error).message}`);
      return defaultVal;
    }
  };

  return {
    posts: readJson<WpPost[]>(path.join(baseDir, 'posts.json'), []),
    postmeta: readJson<WpPostMeta[]>(path.join(baseDir, 'postmeta.json'), []),
    terms: readJson<WpTerm[]>(path.join(baseDir, 'terms.json'), []),
    termTaxonomy: readJson<WpTermTaxonomy[]>(path.join(baseDir, 'term-taxonomy.json'), []),
    termRelationships: readJson<WpTermRelationship[]>(path.join(baseDir, 'term-relationships.json'), []),
    media: readJson<WpMedia[]>(path.join(baseDir, 'media.json'), []),
  };
}

export function loadExclusions(): ExclusionRule[] {
  const configPath = path.resolve(process.cwd(), 'scripts/wordpress-migration/config/exclusions.json');
  if (!fs.existsSync(configPath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw) as ExclusionRule[];
  } catch (err) {
    console.warn(`[loader] Warning: Could not parse exclusions.json: ${(err as Error).message}`);
    return [];
  }
}
