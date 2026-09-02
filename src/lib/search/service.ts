import { prisma } from '@/lib/prisma';

export interface SearchResultItem {
  id: string;
  title: string;
  slug: string;
  type: 'SAINT' | 'PRAYER' | 'NOVENA' | 'CATECHISM' | 'CHURCH_DOCUMENT' | 'FORMATION_PATHWAY';
  typeLabel: string;
  snippet: string;
  href: string;
}

export async function performGlobalSearch(query: string): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  const results: SearchResultItem[] = [];

  const [saints, prayers, novenas, catechismEntries, churchDocuments, formationPathways] =
    await Promise.all([
      prisma.saint.findMany({
        where: {
          publicationStatus: 'PUBLISHED',
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { fullName: { contains: q, mode: 'insensitive' } },
            { biography: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.prayer.findMany({
        where: {
          publicationStatus: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { latinTitle: { contains: q, mode: 'insensitive' } },
            { bodyText: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.novena.findMany({
        where: {
          publicationStatus: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.catechismEntry.findMany({
        where: {
          publicationStatus: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { bodyText: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.churchDocument.findMany({
        where: {
          publicationStatus: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { latinTitle: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.formationPathway.findMany({
        where: {
          publicationStatus: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
    ]);

  for (const s of saints) {
    results.push({
      id: s.id,
      title: s.name,
      slug: s.slug,
      type: 'SAINT',
      typeLabel: 'Saint Biography',
      snippet: s.titleTeaser || s.biography.slice(0, 140) + '...',
      href: `/saints/${s.slug}`,
    });
  }

  for (const p of prayers) {
    results.push({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: 'PRAYER',
      typeLabel: 'Catholic Prayer',
      snippet: p.bodyText.slice(0, 140) + '...',
      href: `/prayers/${p.slug}`,
    });
  }

  for (const n of novenas) {
    results.push({
      id: n.id,
      title: n.title,
      slug: n.slug,
      type: 'NOVENA',
      typeLabel: '9-Day Novena',
      snippet: n.summary.slice(0, 140) + '...',
      href: `/novenas/${n.slug}`,
    });
  }

  for (const c of catechismEntries) {
    results.push({
      id: c.id,
      title: c.title,
      slug: c.slug,
      type: 'CATECHISM',
      typeLabel: `Catechism (CCC ${c.paragraphStart}-${c.paragraphEnd})`,
      snippet: c.bodyText.slice(0, 140) + '...',
      href: `/catechism/${c.slug}`,
    });
  }

  for (const doc of churchDocuments) {
    results.push({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      type: 'CHURCH_DOCUMENT',
      typeLabel: 'Church Document',
      snippet: doc.summary.slice(0, 140) + '...',
      href: `/church-documents/${doc.slug}`,
    });
  }

  for (const fp of formationPathways) {
    results.push({
      id: fp.id,
      title: fp.title,
      slug: fp.slug,
      type: 'FORMATION_PATHWAY',
      typeLabel: 'Formation Pathway',
      snippet: fp.summary.slice(0, 140) + '...',
      href: `/learn/${fp.slug}`,
    });
  }

  return results;
}
