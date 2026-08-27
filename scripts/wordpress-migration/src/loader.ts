import fs from 'fs';
import path from 'path';
import { WpSourcePackage, WpPost, WpPostMeta, WpTerm, WpTermTaxonomy, WpTermRelationship, WpMedia } from './types.js';

export function loadSourcePackage(useFixtures = false): WpSourcePackage {
  const baseDir = path.resolve(
    process.cwd(),
    'scripts/wordpress-migration',
    useFixtures ? 'fixtures' : 'input'
  );

  const readJson = <T>(filename: string, defaultVal: T): T => {
    const filePath = path.join(baseDir, filename);
    if (!fs.existsSync(filePath)) {
      return defaultVal;
    }
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[loader] Warning: Could not parse ${filename}: ${(err as Error).message}`);
      return defaultVal;
    }
  };

  return {
    posts: readJson<WpPost[]>('posts.json', []),
    postmeta: readJson<WpPostMeta[]>('postmeta.json', []),
    terms: readJson<WpTerm[]>('terms.json', []),
    termTaxonomy: readJson<WpTermTaxonomy[]>('term-taxonomy.json', []),
    termRelationships: readJson<WpTermRelationship[]>('term-relationships.json', []),
    media: readJson<WpMedia[]>('media.json', []),
  };
}
