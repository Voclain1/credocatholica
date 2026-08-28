/**
 * Fail-Closed Psalm Versification Resolver for M0.8.
 * Restricts Psalm chapter resolution strictly to the explicit tested mappings
 * required by the 7-day ingestion package.
 */

const VERIFIED_PSALM_CHAPTER_MAP: Record<number, number> = {
  24: 23,  // Sept 3: St. Gregory (Modern Ps 24 -> D-R Vulgate Ps 23)
  33: 32,  // Aug 28 & Sept 2 (Modern Ps 33 -> D-R Vulgate Ps 32)
  63: 62,  // Aug 30: 22nd Sunday Year A (Modern Ps 63 -> D-R Vulgate Ps 62)
  71: 70,  // Aug 29: Beheading of St. John (Modern Ps 71 -> D-R Vulgate Ps 70)
  119: 118, // Aug 31: Mon 22nd Wk (Modern Ps 119 -> D-R Vulgate Ps 118)
  145: 144, // Sept 1: Tue 22nd Wk (Modern Ps 145 -> D-R Vulgate Ps 144)
};

export function mapModernPsalmToDouayRheims(modernCitationRef: string): string {
  if (!modernCitationRef) return modernCitationRef;

  const match = modernCitationRef.match(/^Psalm\s+(\d+)(.*)$/i);
  if (!match) return modernCitationRef;

  const modernChapter = parseInt(match[1], 10);
  const versesPart = match[2];

  const drChapter = VERIFIED_PSALM_CHAPTER_MAP[modernChapter];
  if (drChapter === undefined) {
    throw new Error(
      `Unsupported Psalm chapter '${modernChapter}' in M0.8 fail-closed resolver. Explicit mapping required.`
    );
  }

  return `Psalm ${drChapter}${versesPart}`;
}
