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
  const pathway = await prisma.formationPathway.findUnique({ where: { slug } });
  if (!pathway) return { title: 'Pathway Not Found' };

  return {
    title: `${pathway.title} — Catholic Formation Pathway`,
    description: pathway.summary,
  };
}

export default async function PathwayDetailPage({ params }: Props) {
  const { slug } = await params;

  const pathway = await prisma.formationPathway.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { moduleOrder: 'asc' },
        include: {
          lessons: {
            orderBy: { lessonOrder: 'asc' },
            include: { catechismEntry: true, churchDocument: true },
          },
        },
      },
    },
  });

  if (!pathway || pathway.publicationStatus !== 'PUBLISHED') {
    notFound();
  }

  const totalLessons = pathway.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '48rem' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link href="/learn" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 500 }}>
          ← Formation Pathways
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
          {pathway.modules.length} Modules • {totalLessons} Lessons
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 0.75rem',
          }}
        >
          {pathway.title}
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: '0 0 1rem' }}>
          {pathway.description}
        </p>

        {pathway.estimatedHours && (
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-secondary)', fontWeight: 600, margin: 0 }}>
            Estimated Completion Time: ~{pathway.estimatedHours} Hours
          </p>
        )}
      </header>

      {/* Modules & Lessons List */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {pathway.modules.map((mod) => (
          <section
            key={mod.id}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
            }}
          >
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                Module {mod.moduleOrder}
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0.25rem 0 0.25rem' }}>
                {mod.title}
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {mod.summary}
              </p>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {mod.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', margin: '0 0 0.25rem', color: 'var(--color-primary)' }}>
                      <Link href={`/learn/${pathway.slug}/${mod.slug}/${lesson.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {lesson.title}
                      </Link>
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      {lesson.summary}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {lesson.catechismEntry && (
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-secondary)' }}>
                        CCC {lesson.catechismEntry.paragraphStart}-{lesson.catechismEntry.paragraphEnd}
                      </span>
                    )}
                    {lesson.churchDocument && (
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
                        {lesson.churchDocument.latinTitle || lesson.churchDocument.title}
                      </span>
                    )}
                    <Link
                      href={`/learn/${pathway.slug}/${mod.slug}/${lesson.slug}`}
                      style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none', marginLeft: 'auto' }}
                    >
                      Read Lesson →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
