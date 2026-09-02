import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ day?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const novena = await prisma.novena.findUnique({ where: { slug } });
  if (!novena) return { title: 'Novena Not Found' };

  return {
    title: `${novena.title} — 9-Day Catholic Devotion`,
    description: novena.summary,
  };
}

export default async function NovenaDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sParams = await searchParams;
  const currentDayNumber = parseInt(sParams.day || '1', 10);

  const novena = await prisma.novena.findUnique({
    where: { slug },
    include: {
      saint: true,
      days: { orderBy: { dayNumber: 'asc' } },
    },
  });

  if (!novena || novena.publicationStatus !== 'PUBLISHED') {
    notFound();
  }

  const activeDay =
    novena.days.find((d) => d.dayNumber === currentDayNumber) || novena.days[0];

  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '48rem' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link href="/novenas" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 500 }}>
          ← Novenas Library
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
          9-Day Catholic Novena
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 0.75rem',
          }}
        >
          {novena.title}
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: '0 0 1rem' }}>
          {novena.summary}
        </p>

        {novena.saint && (
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-secondary)', fontWeight: 600, margin: 0 }}>
            Associated Saint:{' '}
            <Link href={`/saints/${novena.saint.slug}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
              {novena.saint.name}
            </Link>
          </p>
        )}
      </header>

      {/* Day Navigation Tabs */}
      <nav aria-label="Novena Days Navigation" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', textAlign: 'center' }}>
          Select Novena Day
        </h2>
        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {novena.days.map((day) => {
            const isSelected = day.dayNumber === activeDay.dayNumber;
            return (
              <Link
                key={day.id}
                href={`/novenas/${novena.slug}?day=${day.dayNumber}`}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isSelected ? '#ffffff' : 'var(--color-primary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Day {day.dayNumber}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Opening Prayer (if present) */}
      {novena.openingPrayer && (
        <section
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Opening Prayer
          </h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', lineHeight: 1.7, color: 'var(--color-primary)', margin: 0 }}>
            {novena.openingPrayer}
          </p>
        </section>
      )}

      {/* Active Day Content */}
      <main
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
            Day {activeDay.dayNumber} of 9
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem', color: 'var(--color-primary)', margin: '0.25rem 0 0.5rem' }}>
            {activeDay.title}
          </h2>
          <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-text-muted)', margin: 0 }}>
            Intention: {activeDay.intention}
          </p>
        </header>

        {activeDay.reflectionText && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-secondary)' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary)', margin: '0 0 0.375rem' }}>
              Spiritual Reflection
            </h4>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
              {activeDay.reflectionText}
            </p>
          </div>
        )}

        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '0.75rem' }}>
            Day {activeDay.dayNumber} Prayer Text
          </h4>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              lineHeight: 1.8,
              color: 'var(--color-primary)',
              whiteSpace: 'pre-line',
            }}
          >
            {activeDay.prayerText}
          </div>
        </div>
      </main>

      {/* Closing Prayer (if present) */}
      {novena.closingPrayer && (
        <section
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Closing Prayer
          </h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', lineHeight: 1.7, color: 'var(--color-primary)', margin: 0 }}>
            {novena.closingPrayer}
          </p>
        </section>
      )}

      {/* Day Pagination Buttons */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {activeDay.dayNumber > 1 ? (
          <Link
            href={`/novenas/${novena.slug}?day=${activeDay.dayNumber - 1}`}
            style={{ padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}
          >
            ← Previous Day ({activeDay.dayNumber - 1})
          </Link>
        ) : <div />}

        {activeDay.dayNumber < 9 && (
          <Link
            href={`/novenas/${novena.slug}?day=${activeDay.dayNumber + 1}`}
            style={{ padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-primary)', color: '#ffffff', fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}
          >
            Next Day ({activeDay.dayNumber + 1}) →
          </Link>
        )}
      </footer>
    </article>
  );
}
