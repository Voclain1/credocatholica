import { prisma } from '@/lib/prisma';
import {
  LiturgicalSeason,
  CelebrationRank,
  LiturgicalColor,
  ReadingType,
  YearCycle,
  WeekdayCycle,
  EcclesialStatus,
  HistoricalConfidence,
} from '@/generated/prisma/client';

/**
 * Interface representing a related Saint linked to a liturgical celebration.
 */
export interface RelatedSaintSummary {
  id: string;
  name: string;
  slug: string;
  titleTeaser?: string | null;
  ecclesialStatus: EcclesialStatus;
  historicalConfidence: HistoricalConfidence;
}

/**
 * Interface representing a liturgical celebration formatted for UI presentation.
 */
export interface PresentationCelebration {
  id: string;
  title: string;
  slug: string;
  rank: CelebrationRank;
  color?: LiturgicalColor | null;
  isOptional: boolean;
  isCommemoration: boolean;
  isTransferred: boolean;
  precedenceOrder: number;
  saint?: RelatedSaintSummary | null;
  biographySummary?: string | null;
}

/**
 * Interface representing an ordered Scripture reading or Psalm.
 */
export interface PresentationReading {
  id: string;
  type: ReadingType;
  readingOrder: number;
  citationRef: string;
  response?: string | null;
  text: string;
  copyrightInfo: string;
}

/**
 * Interface representing a daily spiritual or theological reflection.
 */
export interface PresentationReflection {
  id: string;
  title: string;
  slug: string;
  author: string;
  bodyText: string;
}

/**
 * Discriminated union result payload for getTodayLiturgicalDay().
 */
export type TodayLiturgicalDayResult =
  | {
      status: 'FOUND';
      data: {
        date: Date;
        formattedDate: string;
        isoDate: string;
        calendarCode: string;
        season: LiturgicalSeason;
        seasonWeek?: number | null;
        yearCycle: YearCycle;
        weekdayCycle: WeekdayCycle;
        liturgicalColor: LiturgicalColor;
        gloriaRequired: boolean;
        creedRequired: boolean;
        notes?: string | null;
        principalCelebration?: PresentationCelebration | null;
        primaryCelebration?: PresentationCelebration | null;
        secondaryCelebrations: PresentationCelebration[];
        readings: PresentationReading[];
        reflections: PresentationReflection[];
        timeZoneStrategy: string;
      };
    }
  | {
      status: 'EMPTY';
      formattedDate: string;
      isoDate: string;
      timeZoneStrategy: string;
    }
  | {
      status: 'ERROR';
      formattedDate: string;
      isoDate: string;
      errorDetails: string;
      timeZoneStrategy: string;
    };

/**
 * Backward-compatible lightweight summary payload for homepage preview.
 */
export type TodayLiturgicalResult = TodayLiturgicalDayResult;

/**
 * Resolves the application reference date for liturgical lookups.
 * Isolates date resolution logic in a single helper.
 *
 * TECHNICAL STRATEGY: Uses UTC date string (YYYY-MM-DD) as an interim technical lookup boundary.
 * CredoCatholica is a global platform; user timezone contextualization will be added in future phases.
 * This interim choice is a technical data lookup boundary, NOT a canonical liturgical calculation rule.
 */
export function resolveApplicationDate(targetDate?: Date): {
  dateObj: Date;
  isoDate: string;
  formattedDisplayDate: string;
  timeZoneStrategy: string;
} {
  const dateObj = targetDate ? new Date(targetDate) : new Date();
  const isoDate = dateObj.toISOString().split('T')[0];

  // Format display date nicely e.g. "Friday, August 28, 2026"
  const formattedDisplayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dateObj);

  return {
    dateObj,
    isoDate,
    formattedDisplayDate,
    timeZoneStrategy: 'UTC Interim Technical Lookup Boundary',
  };
}

/**
 * Query function to retrieve today's complete canonical LiturgicalDay data.
 * Consumes existing database records only.
 * Does NOT perform JS date-math season inferences, precedence engine calculations, or content generation.
 */
export async function getTodayLiturgicalDay(targetDate?: Date): Promise<TodayLiturgicalDayResult> {
  const { dateObj, isoDate, formattedDisplayDate, timeZoneStrategy } = resolveApplicationDate(targetDate);

  try {
    const day = await prisma.liturgicalDay.findFirst({
      where: {
        date: new Date(isoDate),
        calendarCode: 'UNIVERSAL',
      },
      include: {
        season: true,
        celebrations: {
          include: {
            celebration: {
              include: {
                saint: true,
              },
            },
          },
          orderBy: {
            precedenceOrder: 'asc',
          },
        },
        readings: {
          orderBy: {
            readingOrder: 'asc',
          },
        },
        reflections: true,
      },
    });

    if (!day) {
      return {
        status: 'EMPTY',
        formattedDate: formattedDisplayDate,
        isoDate,
        timeZoneStrategy,
      };
    }

    // Process celebrations: principal celebration vs secondary/optional celebrations
    const formattedCelebrations: PresentationCelebration[] = day.celebrations.map((rel) => {
      const cel = rel.celebration;
      const saintSummary: RelatedSaintSummary | null = cel.saint
        ? {
            id: cel.saint.id,
            name: cel.saint.name,
            slug: cel.saint.slug,
            titleTeaser: cel.saint.titleTeaser,
            ecclesialStatus: cel.saint.ecclesialStatus,
            historicalConfidence: cel.saint.historicalConfidence,
          }
        : null;

      return {
        id: cel.id,
        title: cel.title,
        slug: cel.slug,
        rank: cel.rank,
        color: cel.color,
        isOptional: rel.isOptional,
        isCommemoration: rel.isCommemoration,
        isTransferred: rel.isTransferred,
        precedenceOrder: rel.precedenceOrder,
        saint: saintSummary,
        biographySummary: cel.biographySummary,
      };
    });

    // Sort: Principal celebration is precedenceOrder === 1, secondary are precedenceOrder > 1
    const principalCelebration =
      formattedCelebrations.find((c) => c.precedenceOrder === 1) ||
      (formattedCelebrations.length > 0 ? formattedCelebrations[0] : null);

    const secondaryCelebrations = formattedCelebrations.filter(
      (c) => c.id !== principalCelebration?.id
    );

    // Format readings: preserve exact text, citations, and responses
    const formattedReadings: PresentationReading[] = day.readings.map((r) => ({
      id: r.id,
      type: r.type,
      readingOrder: r.readingOrder,
      citationRef: r.citationRef,
      response: r.response,
      text: r.text,
      copyrightInfo: r.copyrightInfo,
    }));

    // Format reflections
    const formattedReflections: PresentationReflection[] = day.reflections.map((ref) => ({
      id: ref.id,
      title: ref.title,
      slug: ref.slug,
      author: ref.author,
      bodyText: ref.bodyText,
    }));

    return {
      status: 'FOUND',
      data: {
        date: day.date,
        formattedDate: formattedDisplayDate,
        isoDate,
        calendarCode: day.calendarCode,
        season: day.season,
        seasonWeek: day.seasonWeek,
        yearCycle: day.yearCycle,
        weekdayCycle: day.weekdayCycle,
        liturgicalColor: day.liturgicalColor,
        gloriaRequired: day.gloriaRequired,
        creedRequired: day.creedRequired,
        notes: day.notes,
        principalCelebration,
        primaryCelebration: principalCelebration,
        secondaryCelebrations,
        readings: formattedReadings,
        reflections: formattedReflections,
        timeZoneStrategy,
      },
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown database query error';
    // Log error safely server-side without exposing DB details to client
    console.error(`[lib/liturgy] Error querying LiturgicalDay (${isoDate}): ${errorMsg}`);
    return {
      status: 'ERROR',
      formattedDate: formattedDisplayDate,
      isoDate,
      errorDetails: 'Liturgical data service temporarily unavailable',
      timeZoneStrategy,
    };
  }
}

/**
 * Backward-compatible export for existing homepage summary query.
 */
export async function getTodayLiturgicalSummary(targetDate?: Date): Promise<TodayLiturgicalResult> {
  return getTodayLiturgicalDay(targetDate);
}
