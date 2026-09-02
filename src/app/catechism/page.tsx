import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CatechismPillar } from '@/generated/prisma/client';

export const metadata: Metadata = {
  title: 'Catechism of the Catholic Church — Reference & Pillars',
  description:
    'Explore canonical references to the Catechism of the Catholic Church across the Four Pillars: Profession of Faith, Sacraments, Life in Christ, and Christian Prayer.',
};

export default async function CatechismIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string }>;
}) {
  const params = await searchParams;
  const pillarFilter = params.pillar?.trim().toUpperCase() || '';

  const whereClause: any = {
    publicationStatus: 'PUBLISHED',
  };

  if (pillarFilter && Object.values(CatechismPillar).includes(pillarFilter as CatechismPillar)) {
    whereClause.pillar = pillarFilter as CatechismPillar;
  }

  const catechismEntries = await prisma.catechismEntry.findMany({
    where: whereClause,
    orderBy: { paragraphStart: 'asc' },
  });

  const pillars: { key: CatechismPillar; label: string }[] = [
    { key: 'PART_1_PROFESSION_OF_FAITH', label: 'Part 1: The Creed (Profession of Faith)' },
    { key: 'PART_2_SACRAMENTS', label: 'Part 2: Sacraments (Sacramental Economy)' },
    { key: 'PART_3_LIFE_IN_CHRIST', label: 'Part 3: Morality (Life in Christ)' },
    { key: 'PART_4_CHRISTIAN_PRAYER', label: 'Part 4: Prayer (Christian Prayer)' },
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
          Magisterial Reference
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 1rem',
          }}
        >
          Catechism of the Catholic Church
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
          A structured reference library of canonical Catechism paragraph references, organized according to the Four Pillars of Catholic Doctrine promulgated by Pope John Paul II.
        </p>
      </header>

      {/* Pillar Filter Tabs */}
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
          href="/catechism"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid var(--color-border)',
            backgroundColor: !pillarFilter ? 'var(--color-primary)' : 'var(--color-surface)',
            color: !pillarFilter ? '#ffffff' : 'var(--color-primary)',
          }}
        >
          All Pillars
        </Link>
        {pillars.map((p) => (
          <Link
            key={p.key}
            href={`/catechism?pillar=${p.key}`}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid var(--color-border)',
              backgroundColor: pillarFilter === p.key ? 'var(--color-primary)' : 'var(--color-surface)',
              color: pillarFilter === p.key ? '#ffffff' : 'var(--color-primary)',
            }}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Entries List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {catechismEntries.map((cat) => (
          <article
            key={cat.id}
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
                  CCC {cat.paragraphStart}–{cat.paragraphEnd}
                </span>
                {cat.magisterialWeight && (
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                    {cat.magisterialWeight}
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
                <Link href={`/catechism/${cat.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {cat.title}
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
                {cat.bodyText}
              </p>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Link
                href={`/catechism/${cat.slug}`}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                }}
              >
                Read Catechism Entry →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
