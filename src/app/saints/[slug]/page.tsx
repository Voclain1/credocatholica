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
  const saint = await prisma.saint.findUnique({ where: { slug } });
  if (!saint) return { title: 'Saint Not Found' };

  return {
    title: `${saint.name} — Biography, Patronages & Feast Day`,
    description: saint.titleTeaser || `Canonical Catholic profile of ${saint.name}, featuring biography, patronages, vocations, and prayers.`,
  };
}

export default async function SaintDetailPage({ params }: Props) {
  const { slug } = await params;

  const saint = await prisma.saint.findUnique({
    where: { slug },
    include: {
      patronages: { include: { patronage: true } },
      vocations: { include: { vocation: true } },
      celebrations: {
        include: {
          liturgicalDays: {
            include: { liturgicalDay: true },
          },
        },
      },
      prayers: { include: { prayer: true } },
      novenaList: true,
    },
  });

  if (!saint || saint.publicationStatus !== 'PUBLISHED') {
    notFound();
  }

  const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '52rem' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link href="/saints" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 500 }}>
          ← Saints Library
        </Link>
      </nav>

      {/* Main Header */}
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
            }}
          >
            {saint.ecclesialStatus.replace('_', ' ')}
          </span>
          {saint.isDoctorOfTheChurch && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-secondary)',
                color: '#ffffff',
              }}
            >
              Doctor of the Church
            </span>
          )}
          {saint.isMartyr && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-tertiary)',
                color: '#ffffff',
              }}
            >
              Martyr
            </span>
          )}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 0.5rem',
          }}
        >
          {saint.fullName || saint.name}
        </h1>

        {saint.titleTeaser && (
          <p style={{ fontSize: '1.125rem', color: 'var(--color-secondary)', fontWeight: 500, margin: 0 }}>
            {saint.titleTeaser}
          </p>
        )}
      </header>

      {/* Quick Facts Grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2.5rem',
        }}
      >
        {saint.feastDateMonth && saint.feastDateDay && (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Feast Day
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)', margin: '0.25rem 0 0' }}>
              {MONTH_NAMES[saint.feastDateMonth]} {saint.feastDateDay}
            </p>
          </div>
        )}

        {(saint.birthYear || saint.deathYear) && (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Life Dates
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)', margin: '0.25rem 0 0' }}>
              {saint.birthYear || '?'} — {saint.deathYear || '?'}
            </p>
          </div>
        )}

        {saint.religiousOrder && (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Religious Affiliation
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)', margin: '0.25rem 0 0' }}>
              {saint.religiousOrder}
            </p>
          </div>
        )}

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Historical Evidence
          </span>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)', margin: '0.25rem 0 0' }}>
            {saint.historicalConfidence.replace(/_/g, ' ')}
          </p>
        </div>
      </section>

      {/* Biography & Hagiography */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
          Biography & Hagiography
        </h2>
        <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--color-text)', whiteSpace: 'pre-line' }}>
          {saint.biography}
        </div>
      </section>

      {/* Related Liturgical Celebrations */}
      {saint.celebrations.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            Liturgical Celebrations
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {saint.celebrations.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', margin: 0, color: 'var(--color-primary)' }}>
                    {c.title}
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {c.rank.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Patronages & Vocations */}
      {(saint.patronages.length > 0 || saint.vocations.length > 0) && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            Patronages & State of Life
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {saint.patronages.length > 0 && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', margin: '0 0 0.75rem' }}>Patronages</h3>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                  {saint.patronages.map((p) => (
                    <li key={p.id} style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                      <strong>{p.patronage.name}</strong>: {p.patronage.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {saint.vocations.length > 0 && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', margin: '0 0 0.75rem' }}>State of Life / Vocations</h3>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                  {saint.vocations.map((v) => (
                    <li key={v.id} style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                      <strong>{v.vocation.name}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Associated Prayers */}
      {saint.prayers.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            Associated Prayers & Devotions
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {saint.prayers.map((sp) => (
              <div
                key={sp.id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>
                  <Link href={`/prayers/${sp.prayer.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {sp.prayer.title}
                  </Link>
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                  {sp.prayer.bodyText}
                </p>
                <Link
                  href={`/prayers/${sp.prayer.slug}`}
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}
                >
                  Read Full Prayer →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Associated Novenas */}
      {saint.novenaList.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            Associated Novenas
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {saint.novenaList.map((nov) => (
              <div
                key={nov.id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>
                  <Link href={`/novenas/${nov.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {nov.title}
                  </Link>
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text)', margin: '0 0 0.75rem' }}>
                  {nov.summary}
                </p>
                <Link
                  href={`/novenas/${nov.slug}`}
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}
                >
                  Pray 9-Day Novena →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Provenance & Editorial Standards */}
      <footer
        style={{
          marginTop: '4rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--color-primary)' }}>Sources & Editorial Standards:</strong>
        <p style={{ margin: '0.25rem 0 0' }}>
          This entry has not yet been verified word for word against an identified published source. Publication does not establish historical or doctrinal review.
        </p>
      </footer>
    </article>
  );
}
