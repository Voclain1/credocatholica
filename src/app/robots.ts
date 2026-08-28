import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL || 'https://credocatholica.com';
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    process.env.SITE_ENV === 'production';

  if (isProduction) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  // Non-production (development / preview): disallow search indexing (Correction 4)
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
