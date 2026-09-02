import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Catholic Saints Library — Biographies, Patronages & Feast Days',
  description:
    'Explore the canonical Catholic Saints library on CredoCatholica, featuring factual biographies, patronages, vocations, feast days, and associated prayers.',
};

export default async function SaintsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; letter?: string; patronage?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const letter = params.letter?.trim().toUpperCase() || '';
  const patronageSlug = params.patronage?.trim() || '';

  // Build Prisma filter query
  const whereClause: any = {
    publicationStatus: 'PUBLISHED',
  };

  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { fullName: { contains: q, mode: 'insensitive' } },
      { biography: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (letter && letter.length === 1 && letter >= 'A' && letter <= 'Z') {
    whereClause.name = { startsWith: letter, mode: 'insensitive' };
  }

  if (patronageSlug) {
    whereClause.patronages = {
      some: {
        patronage: {
          slug: patronageSlug,
        },
      },
    };
  }

  const [saints, patronages] = await Promise.all([
    prisma.saint.findMany({
      where: whereClause,
      include: {
        patronages: { include: { patronage: true } },
        vocations: { include: { vocation: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.patronage.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const MONTH_NAMES = [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      {/* Header */}
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
          Reference Library
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 1rem',
          }}
        >
          Catholic Saints & Hagiography
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
          A canonical reference repository of holy men and women who witnessed to Jesus Christ through heroic virtue, martyrdom, and dedicated vocations.
        </p>
      </header>

      {/* Alphabet Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.375rem',
          justifyContent: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <Link
          href="/saints"
          style={{
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            backgroundColor: !letter ? 'var(--color-primary)' : 'transparent',
            color: !letter ? '#ffffff' : 'var(--color-text)',
          }}
        >
          All
        </Link>
        {alphabet.map((char) => (
          <Link
            key={char}
            href={`/saints?letter=${char}`}
            style={{
              padding: '0.375rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: letter === char ? 'var(--color-primary)' : 'transparent',
              color: letter === char ? '#ffffff' : 'var(--color-text)',
            }}
          >
            {char}
          </Link>
        ))}
      </div>

      {/* Patronages Pills */}
      {patronages.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Filter by Patronage
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {patronages.map((p) => (
              <Link
                key={p.id}
                href={`/saints?patronage=${p.slug}`}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '1rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  border: '1px solid var(--color-border)',
                  backgroundColor: patronageSlug === p.slug ? 'var(--color-secondary)' : 'var(--color-surface)',
                  color: patronageSlug === p.slug ? '#ffffff' : 'var(--color-primary)',
                }}
              >
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Saints Grid */}
      {saints.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
            No saints found matching your search query.
          </p>
          <Link
            href="/saints"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              color: 'var(--color-secondary)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Reset Filters
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {saints.map((saint) => (
            <article
              key={saint.id}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                  }}
                >
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
                    {saint.ecclesialStatus.replace('_', ' ')}
                  </span>
                  {saint.feastDateMonth && saint.feastDateDay && (
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                      }}
                    >
                      Feast: {MONTH_NAMES[saint.feastDateMonth]} {saint.feastDateDay}
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.375rem',
                    margin: '0 0 0.5rem',
                    color: 'var(--color-primary)',
                  }}
                >
                  <Link
                    href={`/saints/${saint.slug}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {saint.name}
                  </Link>
                </h3>

                {saint.titleTeaser && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-secondary)',
                      fontWeight: 500,
                      marginBottom: '0.75rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {saint.titleTeaser}
                  </p>
                )}

                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--color-text)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {saint.biography}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <Link
                  href={`/saints/${saint.slug}`}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-secondary)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  View Saint Profile →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
