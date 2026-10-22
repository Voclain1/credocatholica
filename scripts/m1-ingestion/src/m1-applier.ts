import { prisma } from '../../../src/lib/prisma/index.js';
import { M1_SAINTS, M1_PATRONAGES, M1_VOCATIONS, M1SaintRecord } from './saints-data.js';
import { M1_PRAYERS, M1PrayerRecord } from './prayers-data.js';
import { M1_NOVENAS, M1NovenaRecord } from './novenas-data.js';
import { validateM1Dataset, M1ValidationResult } from './m1-validator.js';
import { assertNoPublishedSeedTargets } from './seed-safety.js';

export interface M1ApplyResult {
  validation: M1ValidationResult;
  applied: boolean;
  insertedSaints: number;
  updatedSaints: number;
  insertedPatronages: number;
  updatedPatronages: number;
  insertedVocations: number;
  updatedVocations: number;
  insertedPrayers: number;
  updatedPrayers: number;
  insertedNovenas: number;
  updatedNovenas: number;
  insertedNovenaDays: number;
  updatedNovenaDays: number;
  linkedCelebrations: number;
  linkedSaintPrayers: number;
  linkedSaintNovenas: number;
  linkedSaintPatronages: number;
  linkedSaintVocations: number;
}

export async function applyM1Ingestion(
  saints: M1SaintRecord[] = M1_SAINTS,
  prayers: M1PrayerRecord[] = M1_PRAYERS,
  novenas: M1NovenaRecord[] = M1_NOVENAS
): Promise<M1ApplyResult> {
  const validation = validateM1Dataset(saints, prayers, novenas);
  if (!validation.isValid) {
    return {
      validation,
      applied: false,
      insertedSaints: 0,
      updatedSaints: 0,
      insertedPatronages: 0,
      updatedPatronages: 0,
      insertedVocations: 0,
      updatedVocations: 0,
      insertedPrayers: 0,
      updatedPrayers: 0,
      insertedNovenas: 0,
      updatedNovenas: 0,
      insertedNovenaDays: 0,
      updatedNovenaDays: 0,
      linkedCelebrations: 0,
      linkedSaintPrayers: 0,
      linkedSaintNovenas: 0,
      linkedSaintPatronages: 0,
      linkedSaintVocations: 0,
    };
  }

  // Complete this read-only preflight before changing shared classifications
  // or any content. These legacy summaries have no exact-source evidence.
  const publishedTargets = await Promise.all([
    prisma.saint.findMany({ where: { slug: { in: saints.map((s) => s.slug) }, publicationStatus: 'PUBLISHED' }, select: { slug: true } }),
    prisma.prayer.findMany({ where: { slug: { in: prayers.map((p) => p.slug) }, publicationStatus: 'PUBLISHED' }, select: { slug: true } }),
    prisma.novena.findMany({ where: { slug: { in: novenas.map((n) => n.slug) }, publicationStatus: 'PUBLISHED' }, select: { slug: true } }),
  ]);
  assertNoPublishedSeedTargets(publishedTargets.flat());

  let insertedPatronages = 0;
  let updatedPatronages = 0;
  let insertedVocations = 0;
  let updatedVocations = 0;
  let insertedSaints = 0;
  let updatedSaints = 0;
  let insertedPrayers = 0;
  let updatedPrayers = 0;
  let insertedNovenas = 0;
  let updatedNovenas = 0;
  let insertedNovenaDays = 0;
  let updatedNovenaDays = 0;
  let linkedCelebrations = 0;
  let linkedSaintPrayers = 0;
  let linkedSaintNovenas = 0;
  let linkedSaintPatronages = 0;
  let linkedSaintVocations = 0;

  // Map to track created IDs
  const patronageMap = new Map<string, string>(); // name -> id
  const vocationMap = new Map<string, string>();   // name -> id
  const saintMap = new Map<string, string>();      // slug -> id

  // 1. Ingest Patronages
  for (const p of M1_PATRONAGES) {
    const existing = await prisma.patronage.findUnique({ where: { slug: p.slug } });
    if (existing) {
      const updated = await prisma.patronage.update({
        where: { slug: p.slug },
        data: { name: p.name, description: p.description },
      });
      patronageMap.set(p.name, updated.id);
      updatedPatronages++;
    } else {
      const created = await prisma.patronage.create({
        data: { name: p.name, slug: p.slug, description: p.description },
      });
      patronageMap.set(p.name, created.id);
      insertedPatronages++;
    }
  }

  // 2. Ingest Vocations
  for (const v of M1_VOCATIONS) {
    const existing = await prisma.vocation.findUnique({ where: { slug: v.slug } });
    if (existing) {
      const updated = await prisma.vocation.update({
        where: { slug: v.slug },
        data: { name: v.name, description: v.description },
      });
      vocationMap.set(v.name, updated.id);
      updatedVocations++;
    } else {
      const created = await prisma.vocation.create({
        data: { name: v.name, slug: v.slug, description: v.description },
      });
      vocationMap.set(v.name, created.id);
      insertedVocations++;
    }
  }

  // 3. Ingest Saints
  for (const s of saints) {
    const existing = await prisma.saint.findUnique({ where: { slug: s.slug } });
    const payload = {
      name: s.name,
      fullName: s.fullName ?? null,
      titleTeaser: s.titleTeaser ?? null,
      biography: s.biography,
      birthYear: s.birthYear ?? null,
      deathYear: s.deathYear ?? null,
      century: s.century ?? null,
      feastDateMonth: s.feastDateMonth ?? null,
      feastDateDay: s.feastDateDay ?? null,
      ecclesialStatus: s.ecclesialStatus,
      canonizationYear: s.canonizationYear ?? null,
      canonizedBy: s.canonizedBy ?? null,
      isDoctorOfTheChurch: s.isDoctorOfTheChurch ?? false,
      isMartyr: s.isMartyr ?? false,
      religiousOrder: s.religiousOrder ?? null,
      historicalConfidence: s.historicalConfidence,
      publicationStatus: 'DRAFT' as const,
    };

    let saintId: string;
    if (existing) {
      const updated = await prisma.saint.update({
        where: { slug: s.slug },
        data: payload,
      });
      saintId = updated.id;
      updatedSaints++;
    } else {
      const created = await prisma.saint.create({
        data: { slug: s.slug, ...payload },
      });
      saintId = created.id;
      insertedSaints++;
    }
    saintMap.set(s.slug, saintId);

    // Link Patronages
    for (const patName of s.patronages) {
      const patId = patronageMap.get(patName);
      if (patId) {
        await prisma.saintPatronage.upsert({
          where: { saintId_patronageId: { saintId, patronageId: patId } },
          create: { saintId, patronageId: patId },
          update: {},
        });
        linkedSaintPatronages++;
      }
    }

    // Link Vocations
    for (const vocName of s.vocations) {
      const vocId = vocationMap.get(vocName);
      if (vocId) {
        await prisma.saintVocation.upsert({
          where: { saintId_vocationId: { saintId, vocationId: vocId } },
          create: { saintId, vocationId: vocId },
          update: {},
        });
        linkedSaintVocations++;
      }
    }

    // Link Celebrations
    if (s.celebrationSlugs) {
      for (const celSlug of s.celebrationSlugs) {
        const cel = await prisma.celebration.findUnique({ where: { slug: celSlug } });
        if (cel) {
          await prisma.celebration.update({
            where: { id: cel.id },
            data: { saintId },
          });
          linkedCelebrations++;
        }
      }
    }
  }

  // 4. Ingest Prayers
  for (const p of prayers) {
    const existing = await prisma.prayer.findUnique({ where: { slug: p.slug } });
    const payload = {
      title: p.title,
      latinTitle: p.latinTitle ?? null,
      bodyText: p.bodyText,
      latinText: p.latinText ?? null,
      prayerType: p.prayerType,
      isOfficialFormula: p.isOfficialFormula ?? false,
      isIndulgenced: p.isIndulgenced ?? false,
      seasonalUse: p.seasonalUse ?? null,
      publicationStatus: 'DRAFT' as const,
    };

    let prayerId: string;
    if (existing) {
      const updated = await prisma.prayer.update({
        where: { slug: p.slug },
        data: payload,
      });
      prayerId = updated.id;
      updatedPrayers++;
    } else {
      const created = await prisma.prayer.create({
        data: { slug: p.slug, ...payload },
      });
      prayerId = created.id;
      insertedPrayers++;
    }

    // Link Saint Prayers
    if (p.saintSlugs) {
      for (const saintSlug of p.saintSlugs) {
        const saintId = saintMap.get(saintSlug);
        if (saintId) {
          await prisma.saintPrayer.upsert({
            where: { saintId_prayerId: { saintId, prayerId } },
            create: { saintId, prayerId },
            update: {},
          });
          linkedSaintPrayers++;
        }
      }
    }
  }

  // 5. Ingest Novenas
  for (const n of novenas) {
    const existing = await prisma.novena.findUnique({ where: { slug: n.slug } });
    const saintId = n.saintSlug ? saintMap.get(n.saintSlug) ?? null : null;

    const payload = {
      title: n.title,
      summary: n.summary,
      openingPrayer: n.openingPrayer ?? null,
      closingPrayer: n.closingPrayer ?? null,
      historicalOrigin: n.historicalOrigin ?? null,
      saintId,
      publicationStatus: 'DRAFT' as const,
    };

    let novenaId: string;
    if (existing) {
      const updated = await prisma.novena.update({
        where: { slug: n.slug },
        data: payload,
      });
      novenaId = updated.id;
      updatedNovenas++;
    } else {
      const created = await prisma.novena.create({
        data: { slug: n.slug, ...payload },
      });
      novenaId = created.id;
      insertedNovenas++;
    }

    // Link Saint Novena
    if (saintId) {
      await prisma.saintNovena.upsert({
        where: { saintId_novenaId: { saintId, novenaId } },
        create: { saintId, novenaId },
        update: {},
      });
      linkedSaintNovenas++;
    }

    // Ingest NovenaDays
    for (const d of n.days) {
      const existingDay = await prisma.novenaDay.findUnique({
        where: { novenaId_dayNumber: { novenaId, dayNumber: d.dayNumber } },
      });

      const dayPayload = {
        title: d.title,
        intention: d.intention,
        prayerText: d.prayerText,
        reflectionText: d.reflectionText ?? null,
      };

      if (existingDay) {
        await prisma.novenaDay.update({
          where: { id: existingDay.id },
          data: dayPayload,
        });
        updatedNovenaDays++;
      } else {
        await prisma.novenaDay.create({
          data: {
            novenaId,
            dayNumber: d.dayNumber,
            ...dayPayload,
          },
        });
        insertedNovenaDays++;
      }
    }
  }

  return {
    validation,
    applied: true,
    insertedSaints,
    updatedSaints,
    insertedPatronages,
    updatedPatronages,
    insertedVocations,
    updatedVocations,
    insertedPrayers,
    updatedPrayers,
    insertedNovenas,
    updatedNovenas,
    insertedNovenaDays,
    updatedNovenaDays,
    linkedCelebrations,
    linkedSaintPrayers,
    linkedSaintNovenas,
    linkedSaintPatronages,
    linkedSaintVocations,
  };
}
