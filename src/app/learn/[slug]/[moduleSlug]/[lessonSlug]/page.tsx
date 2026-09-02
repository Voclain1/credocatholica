import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ slug: string; moduleSlug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = await prisma.formationLesson.findUnique({ where: { slug: lessonSlug } });
  if (!lesson) return { title: 'Lesson Not Found' };

  return {
    title: `${lesson.title} — Catholic Formation Lesson`,
    description: lesson.summary,
  };
}

export default async function FormationLessonPage({ params }: Props) {
  const { slug, moduleSlug, lessonSlug } = await params;

  const lesson = await prisma.formationLesson.findUnique({
    where: { slug: lessonSlug },
    include: {
      module: {
        include: {
          pathway: true,
          lessons: { orderBy: { lessonOrder: 'asc' } },
        },
      },
      catechismEntry: true,
      churchDocument: true,
    },
  });

  if (!lesson) {
    notFound();
  }

  const siblings = lesson.module.lessons;
  const currentIndex = siblings.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextLesson = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '46rem' }}>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
        <Link href="/learn" style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>
          Pathways
        </Link>
        <span>/</span>
        <Link href={`/learn/${slug}`} style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>
          {lesson.module.pathway.title}
        </Link>
      </nav>

      {/* Main Header */}
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
          {lesson.module.title} • Lesson {lesson.lessonOrder}
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0.25rem 0 0.5rem',
          }}
        >
          {lesson.title}
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
          {lesson.summary}
        </p>
      </header>

      {/* Main Lesson Body */}
      <main
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
          {lesson.bodyText}
        </div>
      </main>

      {/* Catechism & Document Citations */}
      {(lesson.catechismEntry || lesson.churchDocument) && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Primary Magisterial Sources
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {lesson.catechismEntry && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                  Catechism Paragraphs {lesson.catechismEntry.paragraphStart}–{lesson.catechismEntry.paragraphEnd}
                </span>
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-serif)', margin: '0.25rem 0 0.25rem', color: 'var(--color-primary)' }}>
                  <Link href={`/catechism/${lesson.catechismEntry.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {lesson.catechismEntry.title}
                  </Link>
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {lesson.catechismEntry.bodyText.slice(0, 120)}...
                </p>
              </div>
            )}

            {lesson.churchDocument && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                  Church Document ({lesson.churchDocument.documentType.replace(/_/g, ' ')})
                </span>
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-serif)', margin: '0.25rem 0 0.25rem', color: 'var(--color-primary)' }}>
                  <Link href={`/church-documents/${lesson.churchDocument.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {lesson.churchDocument.title}
                  </Link>
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {lesson.churchDocument.summary.slice(0, 120)}...
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Lesson Navigation Footer */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
        {prevLesson ? (
          <Link
            href={`/learn/${slug}/${moduleSlug}/${prevLesson.slug}`}
            style={{ padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}
          >
            ← Previous Lesson
          </Link>
        ) : <div />}

        {nextLesson ? (
          <Link
            href={`/learn/${slug}/${moduleSlug}/${nextLesson.slug}`}
            style={{ padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-primary)', color: '#ffffff', fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}
          >
            Next Lesson →
          </Link>
        ) : (
          <Link
            href={`/learn/${slug}`}
            style={{ padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-secondary)', color: '#ffffff', fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}
          >
            Complete Pathway ✓
          </Link>
        )}
      </footer>
    </article>
  );
}
