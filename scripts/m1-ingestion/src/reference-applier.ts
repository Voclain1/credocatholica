import { prisma } from '../../../src/lib/prisma/index.js';
import { M1_CATECHISM_ENTRIES, M1_CHURCH_DOCUMENTS } from './catechism-documents-data.js';
import { M1_FORMATION_PATHWAYS } from './formation-data.js';

export async function applyReferenceIngestion() {
  console.log('--- Ingesting Catechism Entries & Church Documents ---');

  let catechismCount = 0;
  for (const cat of M1_CATECHISM_ENTRIES) {
    await prisma.catechismEntry.upsert({
      where: { slug: cat.slug },
      create: {
        title: cat.title,
        slug: cat.slug,
        paragraphStart: cat.paragraphStart,
        paragraphEnd: cat.paragraphEnd,
        pillar: cat.pillar,
        doctrinalLevel: cat.doctrinalLevel,
        magisterialWeight: cat.magisterialWeight,
        councilSource: cat.councilSource,
        bodyText: cat.bodyText,
        publicationStatus: 'PUBLISHED',
        publishedAt: new Date(),
      },
      update: {
        title: cat.title,
        paragraphStart: cat.paragraphStart,
        paragraphEnd: cat.paragraphEnd,
        pillar: cat.pillar,
        doctrinalLevel: cat.doctrinalLevel,
        magisterialWeight: cat.magisterialWeight,
        councilSource: cat.councilSource,
        bodyText: cat.bodyText,
        publicationStatus: 'PUBLISHED',
      },
    });
    catechismCount++;
  }

  let docCount = 0;
  for (const doc of M1_CHURCH_DOCUMENTS) {
    await prisma.churchDocument.upsert({
      where: { slug: doc.slug },
      create: {
        title: doc.title,
        latinTitle: doc.latinTitle,
        slug: doc.slug,
        documentType: doc.documentType,
        promulgationDate: doc.promulgationDate ? new Date(doc.promulgationDate) : null,
        issuingAuthority: doc.issuingAuthority,
        officialUrl: doc.officialUrl,
        summary: doc.summary,
        bodyText: doc.bodyText,
        publicationStatus: 'PUBLISHED',
        publishedAt: new Date(),
      },
      update: {
        title: doc.title,
        latinTitle: doc.latinTitle,
        documentType: doc.documentType,
        promulgationDate: doc.promulgationDate ? new Date(doc.promulgationDate) : null,
        issuingAuthority: doc.issuingAuthority,
        officialUrl: doc.officialUrl,
        summary: doc.summary,
        bodyText: doc.bodyText,
        publicationStatus: 'PUBLISHED',
      },
    });
    docCount++;
  }

  console.log(`- Catechism Entries: ${catechismCount} upserted`);
  console.log(`- Church Documents:  ${docCount} upserted`);

  console.log('\n--- Ingesting Formation Pathways ---');
  let pathwayCount = 0;
  let moduleCount = 0;
  let lessonCount = 0;

  for (const p of M1_FORMATION_PATHWAYS) {
    const pathway = await prisma.formationPathway.upsert({
      where: { slug: p.slug },
      create: {
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        description: p.description,
        estimatedHours: p.estimatedHours,
        publicationStatus: 'PUBLISHED',
        publishedAt: new Date(),
      },
      update: {
        title: p.title,
        summary: p.summary,
        description: p.description,
        estimatedHours: p.estimatedHours,
        publicationStatus: 'PUBLISHED',
      },
    });
    pathwayCount++;

    for (const m of p.modules) {
      const moduleRecord = await prisma.formationModule.upsert({
        where: { slug: m.slug },
        create: {
          pathwayId: pathway.id,
          moduleOrder: m.moduleOrder,
          title: m.title,
          slug: m.slug,
          summary: m.summary,
        },
        update: {
          pathwayId: pathway.id,
          moduleOrder: m.moduleOrder,
          title: m.title,
          summary: m.summary,
        },
      });
      moduleCount++;

      for (const l of m.lessons) {
        let catId: string | null = null;
        if (l.catechismEntrySlug) {
          const cat = await prisma.catechismEntry.findUnique({ where: { slug: l.catechismEntrySlug } });
          if (cat) catId = cat.id;
        }

        let docId: string | null = null;
        if (l.churchDocumentSlug) {
          const doc = await prisma.churchDocument.findUnique({ where: { slug: l.churchDocumentSlug } });
          if (doc) docId = doc.id;
        }

        await prisma.formationLesson.upsert({
          where: { slug: l.slug },
          create: {
            moduleId: moduleRecord.id,
            lessonOrder: l.lessonOrder,
            title: l.title,
            slug: l.slug,
            summary: l.summary,
            bodyText: l.bodyText,
            catechismEntryId: catId,
            churchDocumentId: docId,
          },
          update: {
            moduleId: moduleRecord.id,
            lessonOrder: l.lessonOrder,
            title: l.title,
            summary: l.summary,
            bodyText: l.bodyText,
            catechismEntryId: catId,
            churchDocumentId: docId,
          },
        });
        lessonCount++;
      }
    }
  }

  console.log(`- Pathways: ${pathwayCount} upserted`);
  console.log(`- Modules:  ${moduleCount} upserted`);
  console.log(`- Lessons:  ${lessonCount} upserted`);

  return { catechismCount, docCount, pathwayCount, moduleCount, lessonCount };
}
