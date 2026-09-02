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
  const cat = await prisma.catechismEntry.findUnique({ where: { slug } });
  if (!cat) return { title: 'Catechism Entry Not Found' };

  return {
    title: `${cat.title} (CCC ${cat.paragraphStart}-${cat.paragraphEnd}) — CredoCatholica`,
    description: `Catechism of the Catholic Church paragraph ${cat.paragraphStart}-${cat.paragraphEnd}: ${cat.title}.`,
  };
}

export default async function CatechismDetailPage({ params }: Props) {
  const { slug } = await params;

  const cat = await prisma.catechismEntry.findUnique({
    where: { slug },
    include: {
      formationLessons: {
        include: { module: { include: { pathway: true } } },
      },
    },
  });

  if (!cat || cat.publicationStatus !== 'PUBLISHED') {
    notFound();
  }

  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '46rem' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link href="/catechism" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 500 }}>
          ← Catechism Index
        </Link>
      </nav>

      {/* Main Header */}
      <header style={{ marginBottom: '2.5rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            display: 'inline-block',
            marginBottom: '0.75rem',
          }}
        >
          CCC Paragraphs {cat.paragraphStart}–{cat.paragraphEnd}
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 0.5rem',
          }}
        >
          {cat.title}
        </h1>

        <p style={{ fontSize: '1rem', color: 'var(--color-secondary)', fontWeight: 600, margin: 0 }}>
          Pillar: {cat.pillar.replace(/_/g, ' ')}
        </p>
      </header>

      {/* Main Text Block */}
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
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            lineHeight: 1.8,
            color: 'var(--color-primary)',
          }}
        >
          {cat.bodyText}
        </div>
      </section>

      {/* Magisterial & Council Citations */}
      {(cat.councilSource || cat.doctrinalLevel) && (
        <section
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2.5rem',
            fontSize: '0.9375rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          {cat.councilSource && (
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>Magisterial Citation:</strong> {cat.councilSource}
            </p>
          )}
          {cat.doctrinalLevel && (
            <p style={{ margin: 0 }}>
              <strong>Doctrinal Classification:</strong> {cat.doctrinalLevel}
            </p>
          )}
        </section>
      )}

      {/* Linked Formation Lessons */}
      {cat.formationLessons.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            Related Formation Lessons
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {cat.formationLessons.map((l) => (
              <div
                key={l.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                  {l.module.pathway.title}
                </span>
                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', margin: '0.25rem 0 0.5rem', color: 'var(--color-primary)' }}>
                  <Link href={`/learn/${l.module.pathway.slug}/${l.module.slug}/${l.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {l.title}
                  </Link>
                </h3>
                <Link
                  href={`/learn/${l.module.pathway.slug}/${l.module.slug}/${l.slug}`}
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}
                >
                  Study Lesson →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vatican Link */}
      <footer
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <strong>Official Vatican Source:</strong> Catechism of the Catholic Church, Vatican Publishing House (Libreria Editrice Vaticana).
      </footer>
    </article>
  );
}
