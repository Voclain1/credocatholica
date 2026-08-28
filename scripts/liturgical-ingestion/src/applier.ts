import { prisma } from '../../../src/lib/prisma/index.js';
import {
  SourceIngestionPackage,
  ReconciliationReport,
  SourceDayRecord,
} from './types.js';
import { sanitizeScriptureText, generateSlug } from './normalizer.js';
import {
  LiturgicalColor,
  CelebrationRank,
  ReadingType,
  YearCycle,
  WeekdayCycle,
} from '../../../src/generated/prisma/client.js';

export async function applyIngestionPackage(
  pkg: SourceIngestionPackage,
  report: ReconciliationReport
): Promise<ReconciliationReport['applyResult']> {
  // Safety Gate 1: Check report verdict
  if (report.verdict !== 'APPROVED_FOR_APPLY') {
    throw new Error(
      `APPLY ABORTED: Package verdict is '${report.verdict}'. Apply requires verdict 'APPROVED_FOR_APPLY' with a verified matching human approval manifest.`
    );
  }

  // Safety Gate 2: Check environment variable
  if (process.env.LITURGY_INGEST_ENV !== 'development') {
    throw new Error(
      `APPLY ABORTED: Environment variable LITURGY_INGEST_ENV=development is required to execute database apply.`
    );
  }

  let insertedDays = 0;
  let updatedDays = 0;
  let insertedCelebrations = 0;
  let insertedReadings = 0;
  let failedDays = 0;

  // Process day records in logical date batches (1 transaction per LiturgicalDay)
  for (const dayRecord of pkg.records) {
    const calendarCode = dayRecord.calendarCode || 'UNIVERSAL';
    const targetDate = new Date(dayRecord.date);

    try {
      await prisma.$transaction(async (tx) => {
        // Fetch canonical season
        const season = await tx.liturgicalSeason.findUnique({
          where: { code: dayRecord.seasonCode },
        });

        if (!season) {
          throw new Error(`LiturgicalSeason '${dayRecord.seasonCode}' does not exist in canonical database.`);
        }

        // Upsert LiturgicalDay
        const existingDay = await tx.liturgicalDay.findUnique({
          where: {
            calendarCode_date: {
              calendarCode,
              date: targetDate,
            },
          },
        });

        let dayId: string;

        if (existingDay) {
          updatedDays++;
          dayId = existingDay.id;
          await tx.liturgicalDay.update({
            where: { id: dayId },
            data: {
              seasonId: season.id,
              seasonWeek: dayRecord.seasonWeek ?? null,
              yearCycle: dayRecord.yearCycle as YearCycle,
              weekdayCycle: dayRecord.weekdayCycle as WeekdayCycle,
              liturgicalColor: dayRecord.liturgicalColor as LiturgicalColor,
              gloriaRequired: dayRecord.gloriaRequired,
              creedRequired: dayRecord.creedRequired,
              notes: dayRecord.notes ?? null,
            },
          });

          // Clean up old joined celebrations and readings for idempotency
          await tx.liturgicalDayCelebration.deleteMany({ where: { liturgicalDayId: dayId } });
          await tx.reading.deleteMany({ where: { liturgicalDayId: dayId } });
        } else {
          insertedDays++;
          const newDay = await tx.liturgicalDay.create({
            data: {
              calendarCode,
              date: targetDate,
              seasonId: season.id,
              seasonWeek: dayRecord.seasonWeek ?? null,
              yearCycle: dayRecord.yearCycle as YearCycle,
              weekdayCycle: dayRecord.weekdayCycle as WeekdayCycle,
              liturgicalColor: dayRecord.liturgicalColor as LiturgicalColor,
              gloriaRequired: dayRecord.gloriaRequired,
              creedRequired: dayRecord.creedRequired,
              notes: dayRecord.notes ?? null,
            },
          });
          dayId = newDay.id;
        }

        // Ingest Celebrations
        if (dayRecord.celebrations && dayRecord.celebrations.length > 0) {
          for (const celRecord of dayRecord.celebrations) {
            const slug = celRecord.slug || generateSlug(celRecord.title);

            // Upsert Celebration entity
            const celebration = await tx.celebration.upsert({
              where: { slug },
              create: {
                title: celRecord.title,
                slug,
                rank: celRecord.rank as CelebrationRank,
                color: celRecord.color ? (celRecord.color as LiturgicalColor) : null,
                isMovable: celRecord.isMovable ?? false,
                fixedMonth: celRecord.fixedMonth ?? null,
                fixedDay: celRecord.fixedDay ?? null,
                biographySummary: celRecord.biographySummary ?? null,
              },
              update: {
                title: celRecord.title,
                rank: celRecord.rank as CelebrationRank,
                color: celRecord.color ? (celRecord.color as LiturgicalColor) : null,
                biographySummary: celRecord.biographySummary ?? null,
              },
            });

            insertedCelebrations++;

            // Create LiturgicalDayCelebration link
            await tx.liturgicalDayCelebration.create({
              data: {
                liturgicalDayId: dayId,
                celebrationId: celebration.id,
                precedenceOrder: celRecord.precedenceOrder ?? 1,
                isOptional: celRecord.isOptional ?? false,
                isCommemoration: celRecord.isCommemoration ?? false,
                isTransferred: celRecord.isTransferred ?? false,
              },
            });
          }
        }

        // Ingest Readings
        if (dayRecord.readings && dayRecord.readings.length > 0) {
          for (const readingRecord of dayRecord.readings) {
            const cleanText = sanitizeScriptureText(readingRecord.text);
            await tx.reading.create({
              data: {
                liturgicalDayId: dayId,
                type: readingRecord.type as ReadingType,
                readingOrder: readingRecord.readingOrder,
                citationRef: readingRecord.citationRef,
                response: readingRecord.response ?? null,
                text: cleanText,
                copyrightInfo: readingRecord.copyrightInfo || 'Public Domain (Douay-Rheims Bible)',
              },
            });
            insertedReadings++;
          }
        }
      });
    } catch (err) {
      failedDays++;
      const msg = err instanceof Error ? err.message : 'Unknown transaction error';
      console.error(`[applier] Failed to ingest record for date ${dayRecord.date}: ${msg}`);
    }
  }

  return {
    insertedDays,
    updatedDays,
    insertedCelebrations,
    insertedReadings,
    failedDays,
  };
}
