import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Structured Catholic Formation Pathways — CredoCatholica',
  description:
    'Explore structured Catholic formation pathways covering theology, the Holy Mass, sacraments, and Catholic spiritual life, rooted in Scripture and Tradition.',
};

export default async function FormationIndexPage() {
  const pathways = await prisma.formationPathway.findMany({
    where: { publicationStatus: 'PUBLISHED' },
    include: {
      modules: {
        orderBy: { moduleOrder: 'asc' },
        include: { lessons: { orderBy: { lessonOrder: 'asc' } } },
      },
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
          Structured Formation
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 1rem',
          }}
        >
          Catholic Formation Pathways
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
          Structured learning pathways introducing essential Catholic doctrine, sacramental theology, liturgical understanding, and spiritual prayer.
        </p>
      </header>

      {/* Pathways Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {pathways.map((pathway) => {
          const totalLessons = pathway.modules.reduce((acc, m) => acc + m.lessons.length, 0);

          return (
            <article
              key={pathway.id}
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
                    {pathway.modules.length} Modules • {totalLessons} Lessons
                  </span>
                  {pathway.estimatedHours && (
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                      ~{pathway.estimatedHours} Hours
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
                  <Link href={`/learn/${pathway.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {pathway.title}
                  </Link>
                </h2>

                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--color-text)',
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                  }}
                >
                  {pathway.summary}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <Link
                  href={`/learn/${pathway.slug}`}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-secondary)',
                    textDecoration: 'none',
                  }}
                >
                  Start Pathway →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
