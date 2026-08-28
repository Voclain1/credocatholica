import React from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EditorialLink } from '@/components/ui/EditorialLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { LiturgicalBadge } from '@/components/ui/LiturgicalBadge';
import { getTodayLiturgicalSummary } from '@/lib/liturgy/service';

// Force dynamic server-side rendering for homepage to fetch today's date & database state dynamically
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch today's liturgical day safely via domain service (Server Component boundary)
  const todaySummary = await getTodayLiturgicalSummary();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* SECTION A: HERO / INTRODUCTION */}
      <section className="hero-section">
        <Container>
          <div style={{ maxWidth: '44rem', margin: '0 auto', textAlign: 'center' }}>
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
              Catholic Platform & Reference Library
            </span>
            <h1 className="hero-headline">
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
              CredoCatholica is a structured Catholic digital companion providing daily liturgical texts, a permanent reference library, and structured formation pathways.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <EditorialLink href="/#today" variant="primary">
                Today&apos;s Liturgy
              </EditorialLink>
              <EditorialLink href="/#library" variant="secondary">
                Explore the Library
              </EditorialLink>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION B: TODAY'S LITURGY */}
      <section id="today" className="section-padding">
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
                maxWidth: '42rem',
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
                      color: 'var(--color-primary)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {todaySummary.data.primaryCelebration?.title || todaySummary.data.season.name}
                  </h3>
                </div>
                <LiturgicalBadge
                  color={todaySummary.data.primaryCelebration?.color || todaySummary.data.liturgicalColor}
                  label={todaySummary.data.season.name}
                />
              </div>

              {todaySummary.data.notes && (
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {todaySummary.data.notes}
                </p>
              )}
            </div>
          ) : todaySummary.status === 'ERROR' ? (
            <EmptyState
              title="Liturgical Service Temporarily Unavailable"
              message="The daily liturgical query service encountered a temporary error. Please try again shortly."
            />
          ) : (
            <EmptyState
              title="Daily Liturgical Content Being Prepared"
              message="Liturgical calendar calculations and verified reading texts are being prepared for publication."
            />
          )}
        </Container>
      </section>

      {/* SECTION C: CATHOLIC REFERENCE LIBRARY */}
      <section
        id="library"
        className="section-padding"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Container>
          <SectionHeading
            eyebrow="Pillar II — Reference Library"
            title="Permanent Catholic Library"
            subtitle="Authoritative Catholic reference materials cataloged and cross-referenced relationally."
            centered
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem',
            }}
          >
            {/* Library Card 1: Saints */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.375rem',
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Saints & Martyrs
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Canonical biographies, feast days, patronages, religious orders, and historical source confidence levels.
                </p>
              </div>
              <EditorialLink href="/#library" variant="subtle">
                Saints Domain &rarr;
              </EditorialLink>
            </div>

            {/* Library Card 2: Prayers */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.375rem',
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Prayers & Devotions
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Official Latin and English prayer formulas, Marian devotions, litanies, creeds, and seasonal prayers.
                </p>
              </div>
              <EditorialLink href="/#library" variant="subtle">
                Prayers Domain &rarr;
              </EditorialLink>
            </div>

            {/* Library Card 3: Novenas */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.375rem',
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Novenas
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Structured nine-day devotional series with daily intentions, meditations, and associated saint intercessions.
                </p>
              </div>
              <EditorialLink href="/#library" variant="subtle">
                Novenas Domain &rarr;
              </EditorialLink>
            </div>

            {/* Library Card 4: Catechism */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.375rem',
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Catechism (CCC)
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Paragraph-accurate cross-references across the four pillars of Catholic doctrine and moral teaching.
                </p>
              </div>
              <EditorialLink href="/#library" variant="subtle">
                Catechism Domain &rarr;
              </EditorialLink>
            </div>

            {/* Library Card 5: Church Documents */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.375rem',
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Church Documents
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Papal encyclicals, apostolic exhortations, conciliar constitutions, decrees, and declarations.
                </p>
              </div>
              <EditorialLink href="/#library" variant="subtle">
                Documents Domain &rarr;
              </EditorialLink>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION D: FORMATION PATHWAYS */}
      <section id="formation" className="section-padding">
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-sacred-gold)',
                  marginBottom: '0.5rem',
                }}
              >
                Pillar III — Formation
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2.25rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  marginBottom: '1rem',
                }}
              >
                Structured Formation Pathways
              </h2>
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                Systematic, module-based Catholic instruction designed to guide believers through theology, sacraments, prayer, and moral life in Christ.
              </p>
              <EditorialLink href="/#formation" variant="secondary">
                View Pathways &rarr;
              </EditorialLink>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  color: 'var(--color-primary)',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                Pathway Architecture
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <li style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--color-sacred-gold)', fontWeight: 700 }}>01</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}>
                    <strong>Ordered Sequences:</strong> Structured pathways comprising sequential modules and lessons.
                  </span>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--color-sacred-gold)', fontWeight: 700 }}>02</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}>
                    <strong>Magisterial Grounding:</strong> Cross-referenced directly to Catechism paragraphs and Council documents.
                  </span>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--color-sacred-gold)', fontWeight: 700 }}>03</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}>
                    <strong>Spiritual Depth:</strong> Integrating doctrinal knowledge with personal prayer and spiritual reflection.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION E: EDITORIAL TRUST & ACCURACY */}
      <section
        id="editorial-standards"
        className="section-padding"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-background)',
        }}
      >
        <Container>
          <div style={{ maxWidth: '44rem', margin: '0 auto', textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-sacred-gold)',
                marginBottom: '0.75rem',
              }}
            >
              Fidelitas in Doctrina
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.25rem',
                fontWeight: 600,
                color: 'var(--color-background)',
                marginBottom: '1rem',
              }}
            >
              Strict Editorial Integrity & Sourcing
            </h2>
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'rgba(245, 240, 232, 0.85)',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              CredoCatholica strictly enforces Catholic doctrinal accuracy. Canonical Scripture is sourced from the public domain Douay-Rheims Bible, official prayers are preserved verbatim, and historical saint records maintain explicit source confidence classifications.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                textAlign: 'left',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(245, 240, 232, 0.15)',
              }}
            >
              <div>
                <h4 style={{ color: 'var(--color-sacred-gold)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Canonical Accuracy
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'rgba(245, 240, 232, 0.7)' }}>
                  Zero paraphrasing of canonical Scripture or official prayer text.
                </p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-sacred-gold)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Historical Provenance
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'rgba(245, 240, 232, 0.7)' }}>
                  Clear distinction between documented history, traditional sources, and pious tradition.
                </p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-sacred-gold)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Doctrinal Review
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'rgba(245, 240, 232, 0.7)' }}>
                  Editorial review workflow tracking source verification and doctrinal alignment.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION F: FINAL DISCOVERY AREA */}
      <section className="section-padding">
        <Container>
          <div
            style={{
              padding: '3rem 2rem',
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              maxWidth: '48rem',
              margin: '0 auto',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                marginBottom: '0.75rem',
              }}
            >
              Begin Exploring CredoCatholica
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-text-muted)',
                marginBottom: '1.75rem',
                lineHeight: 1.5,
              }}
            >
              Discover daily liturgical readings, explore saint biographies, and deepen your Catholic faith.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <EditorialLink href="/#today" variant="primary">
                Daily Liturgy
              </EditorialLink>
              <EditorialLink href="/#library" variant="secondary">
                Reference Library
              </EditorialLink>
              <EditorialLink href="/#formation" variant="secondary">
                Formation Pathways
              </EditorialLink>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
