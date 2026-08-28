import { prisma } from '@/lib/prisma';
import { LiturgicalSeason, CelebrationRank, LiturgicalColor } from '@/generated/prisma/client';

export type TodayLiturgicalResult =
  | {
      status: 'FOUND';
      data: {
        date: Date;
        formattedDate: string;
        season: LiturgicalSeason;
        liturgicalColor: LiturgicalColor;
        gloriaRequired: boolean;
        creedRequired: boolean;
        notes?: string | null;
        primaryCelebration?: {
          title: string;
          rank: CelebrationRank;
          color?: LiturgicalColor | null;
        } | null;
      };
    }
  | {
      status: 'EMPTY';
      formattedDate: string;
    }
  | {
      status: 'ERROR';
      formattedDate: string;
      errorDetails: string;
    };

/**
 * Reads today's LiturgicalDay record from the canonical database.
 * Strictly isolates database read queries from presentation components.
 * Does NOT perform JS date-math season inferences or liturgical calculations.
 */
export async function getTodayLiturgicalSummary(targetDate?: Date): Promise<TodayLiturgicalResult> {
  const dateObj = targetDate || new Date();
  const formattedDate = dateObj.toISOString().split('T')[0];

  try {
    const day = await prisma.liturgicalDay.findFirst({
      where: {
        date: new Date(formattedDate),
        calendarCode: 'UNIVERSAL',
      },
      include: {
        season: true,
        celebrations: {
          include: {
            celebration: true,
          },
          orderBy: {
            precedenceOrder: 'asc',
          },
        },
      },
    });

    if (!day) {
      return {
        status: 'EMPTY',
        formattedDate,
      };
    }

    const primaryCelRel = day.celebrations && day.celebrations.length > 0 ? day.celebrations[0] : null;

    return {
      status: 'FOUND',
      data: {
        date: day.date,
        formattedDate,
        season: day.season,
        liturgicalColor: day.liturgicalColor,
        gloriaRequired: day.gloriaRequired,
        creedRequired: day.creedRequired,
        notes: day.notes,
        primaryCelebration: primaryCelRel
          ? {
              title: primaryCelRel.celebration.title,
              rank: primaryCelRel.celebration.rank,
              color: primaryCelRel.celebration.color,
            }
          : null,
      },
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown database query error';
    // Log error safely server-side without exposing credentials or sensitive info
    console.error(`[lib/liturgy] Error querying today's LiturgicalDay (${formattedDate}): ${errorMsg}`);
    return {
      status: 'ERROR',
      formattedDate,
      errorDetails: 'Liturgical data service temporarily unavailable',
    };
  }
}
