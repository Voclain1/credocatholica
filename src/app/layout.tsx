import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

const serifFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const sansFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrlStr = process.env.SITE_URL || 'https://credocatholica.com';
const isProduction =
  process.env.NODE_ENV === 'production' &&
  process.env.SITE_ENV === 'production';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrlStr),
  title: {
    default: 'CredoCatholica — Daily Liturgical Companion & Reference Library',
    template: '%s | CredoCatholica',
  },
  description:
    'CredoCatholica is a global Catholic digital platform providing daily liturgical companionship, a permanent Catholic reference library, and structured formation pathways.',
  openGraph: {
    title: 'CredoCatholica — Daily Liturgical Companion & Reference Library',
    description:
      'A structured Catholic digital platform providing daily liturgical companionship, a permanent Catholic reference library, and structured formation pathways.',
    url: siteUrlStr,
    siteName: 'CredoCatholica',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CredoCatholica',
    description:
      'Daily liturgical companion, permanent Catholic reference library, and structured formation pathways.',
  },
  robots: {
    index: isProduction,
    follow: isProduction,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" style={{ minHeight: 'calc(100vh - 12rem)' }}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
