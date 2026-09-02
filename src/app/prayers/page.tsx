import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PrayerType } from '@/generated/prisma/client';

export const metadata: Metadata = {
  title: 'Catholic Prayers Library — Traditional Prayers & Devotions',
  description:
    'Browse traditional Catholic prayers, Marian devotions, creeds, litanies, and basic prayers with faithful traditional texts and documented provenance.',
};

export default async function PrayersIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeFilter = params.type?.trim().toUpperCase() || '';

  const whereClause: any = {
    publicationStatus: 'PUBLISHED',
  };

  if (typeFilter && Object.values(PrayerType).includes(typeFilter as PrayerType)) {
    whereClause.prayerType = typeFilter as PrayerType;
  }

  const prayers = await prisma.prayer.findMany({
    where: whereClause,
    include: {
      saints: { include: { saint: true } },
    },
    orderBy: { title: 'asc' },
  });

  const prayerTypes: PrayerType[] = [
    'BASIC',
    'MARIAN',
    'CREED',
    'DEVOTIONAL',
    'LITURGICAL',
    'CHAPLET',
    'LITANY',
    'NOVENA_PRAYER',
  ];

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
          Catholic Prayers & Formulas
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
          A canonical repository of Catholic prayers, ancient creeds, Marian antiphons, and traditional formulas preserved in faithful wording with documented source provenance.
        </p>
      </header>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <Link
          href="/prayers"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid var(--color-border)',
            backgroundColor: !typeFilter ? 'var(--color-primary)' : 'var(--color-surface)',
            color: !typeFilter ? '#ffffff' : 'var(--color-primary)',
          }}
        >
          All Prayers
        </Link>
        {prayerTypes.map((t) => (
          <Link
            key={t}
            href={`/prayers?type=${t}`}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid var(--color-border)',
              backgroundColor: typeFilter === t ? 'var(--color-primary)' : 'var(--color-surface)',
              color: typeFilter === t ? '#ffffff' : 'var(--color-primary)',
            }}
          >
            {t.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      {/* Prayers List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {prayers.map((prayer) => (
          <article
            key={prayer.id}
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
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {prayer.prayerType.replace(/_/g, ' ')}
                </span>
                {prayer.latinTitle && (
                  <span style={{ fontSize: '0.8125rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                    {prayer.latinTitle}
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
                <Link href={`/prayers/${prayer.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {prayer.title}
                </Link>
              </h2>

              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--color-text)',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {prayer.bodyText}
              </p>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Link
                href={`/prayers/${prayer.slug}`}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                }}
              >
                Read Prayer Text →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
