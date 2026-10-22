import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catholic Novenas Library — 9-Day Devotions & Prayers',
  description:
    'Pray traditional Catholic 9-day novenas on CredoCatholica, including the Novena to the Holy Spirit, Divine Mercy Novena, Saint Joseph Novena, and Saint Jude Novena.',
};

export default async function NovenasIndexPage() {
  const novenas = await prisma.novena.findMany({
    where: { publicationStatus: 'PUBLISHED' },
    include: {
      saint: true,
      days: { orderBy: { dayNumber: 'asc' } },
    },
    orderBy: { title: 'asc' },
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <p
          style={{
            color: 'var(--color-secondary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
          }}
        >
          Devotional Treasury
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 1rem',
          }}
        >
          Catholic Novenas Library
        </h1>
        <p
          style={{
            maxWidth: '42rem',
            margin: '0 auto',
            color: 'var(--color-text-muted)',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
          }}
        >
          A canonical treasury of traditional nine-day novenas, structured with ordered daily intentions, exact prayer text, and complete day navigation.
        </p>
      </header>

      {/* Novenas Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {novenas.map((novena) => (
          <article
            key={novena.id}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                  }}
                >
                  9-Day Devotion
                </span>
                {novena.saint && (
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                    {novena.saint.name}
                  </span>
                )}
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.375rem',
                  margin: '0 0 0.75rem',
                  color: 'var(--color-primary)',
                }}
              >
                <Link href={`/novenas/${novena.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {novena.title}
                </Link>
              </h2>

              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--color-text)',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {novena.summary}
              </p>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Link
                href={`/novenas/${novena.slug}`}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                }}
              >
                Start 9-Day Novena →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
