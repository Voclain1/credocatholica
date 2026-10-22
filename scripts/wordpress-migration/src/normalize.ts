import {
  PublicationStatus,
  PrayerType,
  CelebrationRank,
  LiturgicalColor,
  YearCycle,
  WeekdayCycle,
  EcclesialStatus,
  HistoricalConfidence,
  CatechismPillar,
  DocumentType,
} from '../../../src/generated/prisma/client.js';

// ==========================================
// EXPLICIT ENUM TRANSLATION MAPS
// ==========================================

export const PUBLICATION_STATUS_MAP: Record<string, PublicationStatus> = {
  publish: PublicationStatus.PUBLISHED,
  draft: PublicationStatus.DRAFT,
  pending: PublicationStatus.IN_REVIEW,
  future: PublicationStatus.APPROVED,
  private: PublicationStatus.ARCHIVED,
};

export const PRAYER_TYPE_MAP: Record<string, PrayerType> = {
  basic: PrayerType.BASIC,
  marian: PrayerType.MARIAN,
  novena: PrayerType.NOVENA_PRAYER,
  novena_prayer: PrayerType.NOVENA_PRAYER,
  litany: PrayerType.LITANY,
  creed: PrayerType.CREED,
  liturgical: PrayerType.LITURGICAL,
  chaplet: PrayerType.CHAPLET,
  devotional: PrayerType.DEVOTIONAL,
};

export const CELEBRATION_RANK_MAP: Record<string, CelebrationRank> = {
  solemnity: CelebrationRank.SOLEMNITY,
  feast: CelebrationRank.FEAST,
  memorial: CelebrationRank.MEMORIAL,
  optional_memorial: CelebrationRank.OPTIONAL_MEMORIAL,
  // Note: 'feria' / 'Feria' is intentionally EXCLUDED. Ferial status is LiturgicalDay context, NOT CelebrationRank.
};

export const LITURGICAL_COLOR_MAP: Record<string, LiturgicalColor> = {
  green: LiturgicalColor.GREEN,
  violet: LiturgicalColor.VIOLET,
  purple: LiturgicalColor.VIOLET,
  white: LiturgicalColor.WHITE,
  red: LiturgicalColor.RED,
  rose: LiturgicalColor.ROSE,
  black: LiturgicalColor.BLACK,
  // Note: 'gold' is intentionally EXCLUDED. Unknown colors must yield UNKNOWN_ENUM / REQUIRES_REVIEW and NOT silently fallback to GREEN.
};

export const YEAR_CYCLE_MAP: Record<string, YearCycle> = {
  'year a': YearCycle.YEAR_A,
  year_a: YearCycle.YEAR_A,
  'year b': YearCycle.YEAR_B,
  year_b: YearCycle.YEAR_B,
  'year c': YearCycle.YEAR_C,
  year_c: YearCycle.YEAR_C,
};

export const WEEKDAY_CYCLE_MAP: Record<string, WeekdayCycle> = {
  'year 1': WeekdayCycle.YEAR_1,
  year_1: WeekdayCycle.YEAR_1,
  'year 2': WeekdayCycle.YEAR_2,
  year_2: WeekdayCycle.YEAR_2,
};

export const ECCLESIAL_STATUS_MAP: Record<string, EcclesialStatus> = {
  servant_of_god: EcclesialStatus.SERVANT_OF_GOD,
  'servant of god': EcclesialStatus.SERVANT_OF_GOD,
  venerable: EcclesialStatus.VENERABLE,
  blessed: EcclesialStatus.BLESSED,
  saint: EcclesialStatus.SAINT,
};

export const HISTORICAL_CONFIDENCE_MAP: Record<string, HistoricalConfidence> = {
  // Legacy single-letter codes
  a: HistoricalConfidence.HISTORICALLY_DOCUMENTED,
  b: HistoricalConfidence.STRONG_TRADITIONAL_SOURCES,
  c: HistoricalConfidence.PIOUS_TRADITION,
  // Full descriptive strings
  historically_documented: HistoricalConfidence.HISTORICALLY_DOCUMENTED,
  'historically documented': HistoricalConfidence.HISTORICALLY_DOCUMENTED,
  strong_traditional_sources: HistoricalConfidence.STRONG_TRADITIONAL_SOURCES,
  'strong traditional sources': HistoricalConfidence.STRONG_TRADITIONAL_SOURCES,
  pious_tradition: HistoricalConfidence.PIOUS_TRADITION,
  'pious tradition': HistoricalConfidence.PIOUS_TRADITION,
};

export const CATECHISM_PILLAR_MAP: Record<string, CatechismPillar> = {
  'part 1: profession of faith': CatechismPillar.PART_1_PROFESSION_OF_FAITH,
  part_1: CatechismPillar.PART_1_PROFESSION_OF_FAITH,
  'part 2: sacraments': CatechismPillar.PART_2_SACRAMENTS,
  part_2: CatechismPillar.PART_2_SACRAMENTS,
  'part 3: life in christ': CatechismPillar.PART_3_LIFE_IN_CHRIST,
  part_3: CatechismPillar.PART_3_LIFE_IN_CHRIST,
  'part 4: christian prayer': CatechismPillar.PART_4_CHRISTIAN_PRAYER,
  part_4: CatechismPillar.PART_4_CHRISTIAN_PRAYER,
};

export const DOCUMENT_TYPE_MAP: Record<string, DocumentType> = {
  encyclical: DocumentType.ENCYCLICAL,
  apostolic_exhortation: DocumentType.APOSTOLIC_EXHORTATION,
  'apostolic exhortation': DocumentType.APOSTOLIC_EXHORTATION,
  apostolic_letter: DocumentType.APOSTOLIC_LETTER,
  'apostolic letter': DocumentType.APOSTOLIC_LETTER,
  apostolic_constitution: DocumentType.APOSTOLIC_CONSTITUTION,
  'apostolic constitution': DocumentType.APOSTOLIC_CONSTITUTION,
  bull: DocumentType.BULL,
  motu_proprio: DocumentType.MOTU_PROPRIO,
  council_constitution: DocumentType.COUNCIL_CONSTITUTION,
  council_decree: DocumentType.COUNCIL_DECREE,
  declaration: DocumentType.DECLARATION,
  catechism: DocumentType.CATECHISM,
};

// ==========================================
// NORMALIZATION HELPERS
// ==========================================

export function normalizeArrayIds(raw: any): number[] {
  if (raw === null || raw === undefined) return [];
  if (typeof raw === 'number') return [raw];
  if (typeof raw === 'string') {
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? [] : [parsed];
  }
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === 'number' ? item : parseInt(String(item), 10)))
      .filter((num) => !isNaN(num));
  }
  return [];
}

export function normalizeSingleId(raw: any): number | null {
  const ids = normalizeArrayIds(raw);
  return ids.length > 0 ? ids[0] : null;
}

export function normalizeSlug(name: string, fallbackSlug?: string): string {
  if (fallbackSlug && fallbackSlug.trim()) {
    return fallbackSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  }
  return name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function parseEnum<T>(value: any, map: Record<string, T>): { result?: T; rawValue: string } {
  const rawValue = String(value || '').trim().toLowerCase();
  const result = map[rawValue];
  return { result, rawValue };
}
