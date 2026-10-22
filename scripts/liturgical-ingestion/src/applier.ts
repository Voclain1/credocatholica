import { prisma } from '../../../src/lib/prisma/index.js';
import {
  SourceIngestionPackage,
  ReconciliationReport,
  SourceDayRecord,
  getReadingSetSourceKey,
  getReadingSourceKey,
} from './types.js';
import { sanitizeScriptureText, generateSlug } from './normalizer.js';
import { assertExactReadingTexts } from '../../content-audit/exact-reading-gate.js';
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

  // A hash-approved package can still contain paraphrases or incomplete ranges.
  // Establish source fidelity before entering any per-day transaction.
  assertExactReadingTexts(pkg);

  let insertedDays = 0;
  let updatedDays = 0;
  let insertedCelebrations = 0;
  let updatedCelebrations = 0;
  let insertedReadingSets = 0;
  let updatedReadingSets = 0;
  let insertedReadings = 0;
  let updatedReadings = 0;
  let omittedRetainedSets = 0;
  let omittedRetainedReadings = 0;
  let explicitlyDeletedSets = 0;
  let explicitlyDeletedReadings = 0;
  let failedDays = 0;

  // Process day records in logical date batches (1 transaction per LiturgicalDay)
  for (const dayRecord of pkg.records) {
    const calendarCode = dayRecord.calendarCode || 'UNIVERSAL';
    const targetDate = new Date(dayRecord.date);

    try {
      await prisma.$transaction(
        async (tx) => {
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

          // Ingest Celebrations & Link rows without delete/recreate
          const appliedCelebrationIds: string[] = [];
          if (dayRecord.celebrations && dayRecord.celebrations.length > 0) {
            for (const celRecord of dayRecord.celebrations) {
              const slug = celRecord.slug || generateSlug(celRecord.title);

              const existingCel = await tx.celebration.findUnique({ where: { slug } });
              let celebrationId: string;

              if (existingCel) {
                updatedCelebrations++;
                celebrationId = existingCel.id;
                await tx.celebration.update({
                  where: { id: celebrationId },
                  data: {
                    title: celRecord.title,
                    rank: celRecord.rank as CelebrationRank,
                    color: celRecord.color ? (celRecord.color as LiturgicalColor) : null,
                    biographySummary: celRecord.biographySummary ?? null,
                  },
                });
              } else {
                insertedCelebrations++;
                const newCel = await tx.celebration.create({
                  data: {
                    title: celRecord.title,
                    slug,
                    rank: celRecord.rank as CelebrationRank,
                    color: celRecord.color ? (celRecord.color as LiturgicalColor) : null,
                    isMovable: celRecord.isMovable ?? false,
                    fixedMonth: celRecord.fixedMonth ?? null,
                    fixedDay: celRecord.fixedDay ?? null,
                    biographySummary: celRecord.biographySummary ?? null,
                  },
                });
                celebrationId = newCel.id;
              }
              appliedCelebrationIds.push(celebrationId);

              // Upsert LiturgicalDayCelebration link row
              const existingLink = await tx.liturgicalDayCelebration.findUnique({
                where: {
                  liturgicalDayId_celebrationId: {
                    liturgicalDayId: dayId,
                    celebrationId,
                  },
                },
              });

              if (existingLink) {
                await tx.liturgicalDayCelebration.update({
                  where: { id: existingLink.id },
                  data: {
                    precedenceOrder: celRecord.precedenceOrder ?? 1,
                    isOptional: celRecord.isOptional ?? false,
                    isCommemoration: celRecord.isCommemoration ?? false,
                    isTransferred: celRecord.isTransferred ?? false,
                  },
                });
              } else {
                await tx.liturgicalDayCelebration.create({
                  data: {
                    liturgicalDayId: dayId,
                    celebrationId,
                    precedenceOrder: celRecord.precedenceOrder ?? 1,
                    isOptional: celRecord.isOptional ?? false,
                    isCommemoration: celRecord.isCommemoration ?? false,
                    isTransferred: celRecord.isTransferred ?? false,
                  },
                });
              }
            }
          }

          // Clean up obsolete celebration link rows for this day
          await tx.liturgicalDayCelebration.deleteMany({
            where: {
              liturgicalDayId: dayId,
              celebrationId: { notIn: appliedCelebrationIds },
            },
          });

          // Ingest ReadingSets & Readings cleanly by stable sourceKey identity
          const readingSetsToApply = dayRecord.readingSets && dayRecord.readingSets.length > 0
            ? dayRecord.readingSets
            : [];

          const appliedSetKeys: string[] = [];

          for (const setRecord of readingSetsToApply) {
            const setOrder = setRecord.setOrder ?? 1;
            const sourceKey = getReadingSetSourceKey(setRecord);
            appliedSetKeys.push(sourceKey);

            const existingSet = await tx.readingSet.findUnique({
              where: {
                liturgicalDayId_sourceKey: {
                  liturgicalDayId: dayId,
                  sourceKey,
                },
              },
            });

            let setId: string;

            if (existingSet) {
              updatedReadingSets++;
              setId = existingSet.id;
              await tx.readingSet.update({
                where: { id: setId },
                data: {
                  context: setRecord.context as any,
                  setOrder,
                  selectionStatus: (setRecord.selectionStatus as any) || 'SOLE_SET',
                  label: setRecord.label,
                  description: setRecord.description ?? null,
                  isCanonicalDefault: setRecord.isCanonicalDefault ?? null,
                  sourceUrl: setRecord.sourceUrl,
                  lectionaryNumber: setRecord.lectionaryNumber ?? null,
                },
              });
            } else {
              insertedReadingSets++;
              const newSet = await tx.readingSet.create({
                data: {
                  liturgicalDayId: dayId,
                  context: setRecord.context as any,
                  sourceKey,
                  selectionStatus: (setRecord.selectionStatus as any) || 'SOLE_SET',
                  label: setRecord.label,
                  description: setRecord.description ?? null,
                  setOrder,
                  isCanonicalDefault: setRecord.isCanonicalDefault ?? null,
                  sourceUrl: setRecord.sourceUrl,
                  lectionaryNumber: setRecord.lectionaryNumber ?? null,
                },
              });
              setId = newSet.id;
            }

            // Ingest Readings for this ReadingSet
            const appliedReadingKeys: string[] = [];
            if (setRecord.readings && setRecord.readings.length > 0) {
              for (const readingRecord of setRecord.readings) {
                const readingOrder = readingRecord.readingOrder;
                const readingSourceKey = getReadingSourceKey(readingRecord);
                appliedReadingKeys.push(readingSourceKey);

                const cleanText = sanitizeScriptureText(readingRecord.text);
                const copyright = readingRecord.copyrightInfo ||
                  'Douay-Rheims Version, Challoner Revision. Source text: Project Gutenberg eBook #1581. Project Gutenberg identifies this text as public domain in the USA; reuse outside the USA is subject to applicable local law.';

                const existingReading = await tx.reading.findUnique({
                  where: {
                    readingSetId_sourceKey: {
                      readingSetId: setId,
                      sourceKey: readingSourceKey,
                    },
                  },
                });

                if (existingReading) {
                  updatedReadings++;
                  await tx.reading.update({
                    where: { id: existingReading.id },
                    data: {
                      type: readingRecord.type as ReadingType,
                      readingOrder,
                      citationRef: readingRecord.citationRef,
                      scriptureRef: readingRecord.scriptureRef ?? null,
                      response: readingRecord.response ?? null,
                      text: cleanText,
                      textStatus: (readingRecord.textStatus as any) || 'VERIFIED_EXACT',
                      copyrightInfo: copyright,
                    },
                  });
                } else {
                  insertedReadings++;
                  await tx.reading.create({
                    data: {
                      readingSetId: setId,
                      type: readingRecord.type as ReadingType,
                      sourceKey: readingSourceKey,
                      readingOrder,
                      citationRef: readingRecord.citationRef,
                      scriptureRef: readingRecord.scriptureRef ?? null,
                      response: readingRecord.response ?? null,
                      text: cleanText,
                      textStatus: (readingRecord.textStatus as any) || 'VERIFIED_EXACT',
                      copyrightInfo: copyright,
                    },
                  });
                }
              }
            }

            // Reconcile omitted readings for this set non-destructively
            const existingReadingsInSet = await tx.reading.findMany({
              where: { readingSetId: setId },
            });

            const dayDeletions = dayRecord.deletions || [];
            const pkgDeletions = pkg.metadata.deletions || [];
            const allDeletions = [...pkgDeletions, ...dayDeletions];

            for (const existingReading of existingReadingsInSet) {
              if (!appliedReadingKeys.includes(existingReading.sourceKey)) {
                const explicitDeletion = allDeletions.find(
                  (d) => d.entityType === 'READING' && d.sourceKey === existingReading.sourceKey
                );

                if (explicitDeletion) {
                  await tx.reading.delete({ where: { id: existingReading.id } });
                  explicitlyDeletedReadings++;
                } else {
                  omittedRetainedReadings++;
                }
              }
            }
          }

          // Reconcile omitted ReadingSets for this day non-destructively
          const existingSetsInDay = await tx.readingSet.findMany({
            where: { liturgicalDayId: dayId },
          });

          const dayDeletions = dayRecord.deletions || [];
          const pkgDeletions = pkg.metadata.deletions || [];
          const allDeletions = [...pkgDeletions, ...dayDeletions];

          for (const existingSet of existingSetsInDay) {
            if (!appliedSetKeys.includes(existingSet.sourceKey)) {
              const explicitDeletion = allDeletions.find(
                (d) => d.entityType === 'READING_SET' && d.sourceKey === existingSet.sourceKey
              );

              if (explicitDeletion) {
                await tx.readingSet.delete({ where: { id: existingSet.id } });
                explicitlyDeletedSets++;
              } else {
                omittedRetainedSets++;
              }
            }
          }
        },
        { timeout: 20000, maxWait: 10000 }
      );
    } catch (err) {
      failedDays++;
      console.error(`[applier] Failed to ingest record for date ${dayRecord.date}:`, err);
    }
  }

  return {
    insertedDays,
    updatedDays,
    insertedCelebrations,
    updatedCelebrations,
    insertedReadingSets,
    updatedReadingSets,
    insertedReadings,
    updatedReadings,
    omittedRetainedSets,
    omittedRetainedReadings,
    explicitlyDeletedSets,
    explicitlyDeletedReadings,
    failedDays,
  };
}
