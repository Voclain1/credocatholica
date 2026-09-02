import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://credocatholica.com';

  const [saints, prayers, novenas, catechismEntries, churchDocuments, pathways] = await Promise.all([
    prisma.saint.findMany({ select: { slug: true, updatedAt: true }, where: { publicationStatus: 'PUBLISHED' } }),
    prisma.prayer.findMany({ select: { slug: true, updatedAt: true }, where: { publicationStatus: 'PUBLISHED' } }),
    prisma.novena.findMany({ select: { slug: true, updatedAt: true }, where: { publicationStatus: 'PUBLISHED' } }),
    prisma.catechismEntry.findMany({ select: { slug: true, updatedAt: true }, where: { publicationStatus: 'PUBLISHED' } }),
    prisma.churchDocument.findMany({ select: { slug: true, updatedAt: true }, where: { publicationStatus: 'PUBLISHED' } }),
    prisma.formationPathway.findMany({ select: { slug: true, updatedAt: true }, where: { publicationStatus: 'PUBLISHED' } }),
  ]);

  const staticRoutes = [
    '',
    '/today',
    '/saints',
    '/prayers',
    '/novenas',
    '/catechism',
    '/church-documents',
    '/learn',
    '/search',
    '/about',
    '/editorial-standards',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const saintRoutes = saints.map((s) => ({
    url: `${baseUrl}/saints/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const prayerRoutes = prayers.map((p) => ({
    url: `${baseUrl}/prayers/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const novenaRoutes = novenas.map((n) => ({
    url: `${baseUrl}/novenas/${n.slug}`,
    lastModified: n.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const catechismRoutes = catechismEntries.map((c) => ({
    url: `${baseUrl}/catechism/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const documentRoutes = churchDocuments.map((doc) => ({
    url: `${baseUrl}/church-documents/${doc.slug}`,
    lastModified: doc.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const pathwayRoutes = pathways.map((fp) => ({
    url: `${baseUrl}/learn/${fp.slug}`,
    lastModified: fp.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...saintRoutes,
    ...prayerRoutes,
    ...novenaRoutes,
    ...catechismRoutes,
    ...documentRoutes,
    ...pathwayRoutes,
  ];
}
