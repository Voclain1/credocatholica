import { correctOfficialDocumentUrl, DOCUMENT_METADATA_CORRECTIONS } from '../../src/lib/content/document-sources.js';

export interface DocumentMetadata {
  id: string;
  slug: string;
  title: string;
  documentType: string;
  officialUrl: string | null;
  updatedAt: Date;
}

export interface DocumentCorrection {
  id: string;
  slug: string;
  updatedAt: Date;
  before: { title: string; documentType: string; officialUrl: string | null };
  after: { title: string; documentType: string; officialUrl: string | null };
  evidence: string;
}

export function planDocumentCorrections(documents: DocumentMetadata[]): DocumentCorrection[] {
  const corrections: DocumentCorrection[] = [];
  for (const doc of documents) {
    const before = { title: doc.title, documentType: doc.documentType, officialUrl: doc.officialUrl };
    const after = { ...before, officialUrl: correctOfficialDocumentUrl(doc.officialUrl) };
    if (doc.slug === 'patris-corde' && (doc.officialUrl?.includes('20201208_patris-corde') || /^Patris Corde\b/i.test(doc.title))) {
      Object.assign(after, DOCUMENT_METADATA_CORRECTIONS['patris-corde']);
    }
    // This legacy slug must not cause an actual complete CCC record to be
    // relabelled. The issuing source must identify Fidei Depositum specifically.
    if (doc.slug === 'catechism-of-the-catholic-church' && doc.officialUrl?.includes('19921011_fidei-depositum')) {
      Object.assign(after, DOCUMENT_METADATA_CORRECTIONS['catechism-of-the-catholic-church']);
    }
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      corrections.push({ id: doc.id, slug: doc.slug, updatedAt: doc.updatedAt, before, after, evidence: after.officialUrl ?? '' });
    }
  }
  return corrections;
}
