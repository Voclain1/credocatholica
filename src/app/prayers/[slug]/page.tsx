import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prayer = await prisma.prayer.findUnique({ where: { slug } });
  if (!prayer) return { title: 'Prayer Not Found' };

  return {
    title: `${prayer.title} — Catholic Prayer Text & Provenance`,
    description: `Exact traditional text of ${prayer.title} on CredoCatholica, with Latin version and source provenance notes.`,
  };
}

export default async function PrayerDetailPage({ params }: Props) {
  const { slug } = await params;

  const prayer = await prisma.prayer.findUnique({
    where: { slug },
    include: {
      saints: { include: { saint: true } },
    },
  });

  if (!prayer || prayer.publicationStatus !== 'PUBLISHED') {
    notFound();
  }

  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '46rem' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link href="/prayers" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 500 }}>
          ← Prayers Treasury
        </Link>
      </nav>

      {/* Main Header */}
      <header style={{ marginBottom: '2.5rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            display: 'inline-block',
            marginBottom: '0.75rem',
          }}
        >
          {prayer.prayerType.replace(/_/g, ' ')}
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 0.5rem',
          }}
        >
          {prayer.title}
        </h1>

        {prayer.latinTitle && (
          <p style={{ fontSize: '1.125rem', fontStyle: 'italic', color: 'var(--color-secondary)', margin: 0 }}>
            {prayer.latinTitle}
          </p>
        )}
      </header>

      {/* English Text Box */}
      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          English Formula
        </h2>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            lineHeight: 1.8,
            color: 'var(--color-primary)',
            whiteSpace: 'pre-line',
          }}
        >
          {prayer.bodyText}
        </div>
      </section>

      {/* Latin Text Box (if present) */}
      {prayer.latinText && (
        <section
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Latin Formula (Textus Latinus)
          </h2>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.1875rem',
              lineHeight: 1.8,
              color: 'var(--color-primary)',
              fontStyle: 'italic',
              whiteSpace: 'pre-line',
            }}
          >
            {prayer.latinText}
          </div>
        </section>
      )}

      {/* Associated Saints */}
      {prayer.saints.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Associated Saints & Patronages
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {prayer.saints.map((sp) => (
              <Link
                key={sp.id}
                href={`/saints/${sp.saint.slug}`}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-secondary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.9375rem',
                }}
              >
                {sp.saint.name} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Provenance Footer */}
      <footer
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
        }}
      >
        <strong>Canonical Provenance:</strong> Public domain traditional Catholic prayer formula preserved according to authoritative Church tradition.
      </footer>
    </article>
  );
}
