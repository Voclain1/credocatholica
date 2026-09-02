import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EditorialLink } from '@/components/ui/EditorialLink';
import { LiturgicalBadge } from '@/components/ui/LiturgicalBadge';
import { getTodayLiturgicalSummary } from '@/lib/liturgy/service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CredoCatholica — Global Catholic Companion & Reference Library',
  description:
    'CredoCatholica is a structured Catholic digital platform providing daily liturgical companionship, a permanent Catholic reference library, and structured formation pathways.',
};

export default async function HomePage() {
  const todaySummary = await getTodayLiturgicalSummary();

  const [saintsCount, prayersCount, novenasCount, catechismCount, pathwaysCount] = await Promise.all([
    prisma.saint.count({ where: { publicationStatus: 'PUBLISHED' } }),
    prisma.prayer.count({ where: { publicationStatus: 'PUBLISHED' } }),
    prisma.novena.count({ where: { publicationStatus: 'PUBLISHED' } }),
    prisma.catechismEntry.count({ where: { publicationStatus: 'PUBLISHED' } }),
    prisma.formationPathway.count({ where: { publicationStatus: 'PUBLISHED' } }),
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>
      {/* HERO SECTION */}
      <section className="hero-section" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <Container>
          <div style={{ maxWidth: '46rem', margin: '0 auto', textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-sacred-gold)',
                marginBottom: '1rem',
              }}
            >
              Catholic Companion & Digital Reference Platform
            </span>
            <h1 className="hero-headline" style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--color-primary)', margin: '0 0 1.25rem' }}>
              Faith Received. Truth Preserved. Life Formed.
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              CredoCatholica provides daily liturgical companionship, a permanent Catholic reference library, traditional prayers, 9-day novenas, and structured formation pathways.
            </p>

            {/* Search Bar Form */}
            <form action="/search" method="GET" style={{ display: 'flex', gap: '0.5rem', maxWidth: '32rem', margin: '0 auto 2rem' }}>
              <input
                type="text"
                name="q"
                placeholder="Search saints, prayers, novenas, Catechism, documents..."
                required
                minLength={2}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  fontSize: '1rem',
                  color: 'var(--color-primary)',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                }}
              >
                Search
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <EditorialLink href="/today" variant="primary">
                Today&apos;s Liturgy →
              </EditorialLink>
              <EditorialLink href="/#library" variant="secondary">
                Explore Reference Library
              </EditorialLink>
            </div>
          </div>
        </Container>
      </section>

      {/* TODAY'S LITURGY PREVIEW */}
      <section id="today">
        <Container>
          <SectionHeading
            eyebrow="Pillar I — Daily Companion"
            title="Today's Liturgy"
            subtitle="Scripture readings, liturgical celebrations, and sanctoral observances for the Universal Roman Calendar."
            centered
          />

          {todaySummary.status === 'FOUND' ? (
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                maxWidth: '44rem',
                margin: '0 auto',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'block' }}>
                    {todaySummary.data.formattedDate}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      margin: '0.25rem 0 0',
                    }}
                  >
                    {todaySummary.data.principalCelebration?.title || todaySummary.data.season.name}
                  </h3>
                </div>

                <LiturgicalBadge
                  color={todaySummary.data.liturgicalColor}
                  label={todaySummary.data.liturgicalColor}
                />
              </div>

              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Season: <strong>{todaySummary.data.season.name}</strong> • Readings Count: <strong>{todaySummary.data.readings.length}</strong>
              </p>

              <div style={{ textAlign: 'center' }}>
                <EditorialLink href="/today" variant="primary">
                  Open Today&apos;s Mass Readings →
                </EditorialLink>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <EditorialLink href="/today" variant="primary">
                Open Daily Liturgical Companion →
              </EditorialLink>
            </div>
          )}
        </Container>
      </section>

      {/* CATHOLIC REFERENCE LIBRARY GRID */}
      <section id="library">
        <Container>
          <SectionHeading
            eyebrow="Pillar II — Reference Treasury"
            title="Catholic Reference Library"
            subtitle="Explore canonical Saints, traditional Catholic prayers, 9-day novenas, Catechism entries, and conciliar documents."
            centered
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Saints Card */}
            <article style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                  {saintsCount} Profiles Ingested
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0.5rem 0 0.75rem' }}>
                  Catholic Saints & Hagiography
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Biographies, feast days, patronages, and vocations of holy men and women.
                </p>
              </div>
              <Link href="/saints" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}>
                Browse Saints Library →
              </Link>
            </article>

            {/* Prayers Card */}
            <article style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                  {prayersCount} Traditional Formulas
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0.5rem 0 0.75rem' }}>
                  Catholic Prayers Treasury
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Traditional Catholic prayers, Marian antiphons, and creeds with Latin texts.
                </p>
              </div>
              <Link href="/prayers" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}>
                Browse Prayers Treasury →
              </Link>
            </article>

            {/* Novenas Card */}
            <article style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                  {novenasCount} 9-Day Devotions
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0.5rem 0 0.75rem' }}>
                  Catholic Novenas Library
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Traditional nine-day novenas with daily intentions, reflections, and full day navigation.
                </p>
              </div>
              <Link href="/novenas" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}>
                Browse Novenas Library →
              </Link>
            </article>

            {/* Catechism Card */}
            <article style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                  {catechismCount} Paragraph References
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0.5rem 0 0.75rem' }}>
                  Catechism of the Catholic Church
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Reference entries structured across the Four Pillars of Catholic Doctrine.
                </p>
              </div>
              <Link href="/catechism" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}>
                Browse Catechism Index →
              </Link>
            </article>

            {/* Church Documents Card */}
            <article style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                  Conciliar & Papal Magisterium
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0.5rem 0 0.75rem' }}>
                  Church Documents & Constitutions
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Vatican II Constitutions, Papal Encyclicals, and Apostolic Exhortations.
                </p>
              </div>
              <Link href="/church-documents" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}>
                Browse Church Documents →
              </Link>
            </article>

            {/* Formation Card */}
            <article style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                  {pathwaysCount} Structured Pathways
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0.5rem 0 0.75rem' }}>
                  Structured Formation Pathways
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Guided study pathways through Catholic theology, the Holy Mass, and prayer.
                </p>
              </div>
              <Link href="/learn" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}>
                Explore Formation Pathways →
              </Link>
            </article>
          </div>
        </Container>
      </section>
    </div>
  );
}
