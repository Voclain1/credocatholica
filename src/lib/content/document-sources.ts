/** Corrections grounded in the issuing authority's document headers. */
export const DOCUMENT_METADATA_CORRECTIONS = {
  'patris-corde': {
    documentType: 'APOSTOLIC_LETTER',
    officialUrl: 'https://www.vatican.va/content/francesco/en/apost_letters/documents/papa-francesco-lettera-ap_20201208_patris-corde.html',
  },
  'catechism-of-the-catholic-church': {
    title: 'Fidei Depositum (Apostolic Constitution on the Publication of the Catechism)',
    documentType: 'APOSTOLIC_CONSTITUTION',
    officialUrl: 'https://www.vatican.va/content/john-paul-ii/en/apost_constitutions/documents/hf_jp-ii_apc_19921011_fidei-depositum.html',
  },
} as const;

/** Fix only the observed Vatican II path error on the official Vatican host. */
export function correctOfficialDocumentUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (parsed.protocol === 'https:' && parsed.hostname === 'www.vatican.va') {
      parsed.pathname = parsed.pathname.replace('/archive/hist_councils/vatican_ii/', '/archive/hist_councils/ii_vatican_council/');
      return parsed.href;
    }
  } catch {
    return null;
  }
  return url;
}
