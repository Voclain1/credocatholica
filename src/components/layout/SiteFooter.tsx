import React from 'react';
import Link from 'next/link';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-background)',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
        borderTop: '3px solid var(--color-sacred-gold)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid rgba(245, 240, 232, 0.15)',
          }}
        >
          {/* Area 1: Brand & Mission */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--color-background)',
                marginBottom: '0.75rem',
              }}
            >
              CredoCatholica
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(245, 240, 232, 0.75)',
                lineHeight: 1.6,
                maxWidth: '22rem',
              }}
            >
              A structured Catholic digital platform providing daily liturgical companionship, a permanent reference library, and formation pathways.
            </p>
          </div>

          {/* Area 2: Daily Companion & Devotions */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-sacred-gold)',
                marginBottom: '1rem',
              }}
            >
              Liturgy & Devotions
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <li>
                <Link href="/today" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.9 }}>
                  Today&apos;s Liturgy
                </Link>
              </li>
              <li>
                <Link href="/saints" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.9 }}>
                  Saints & Hagiography
                </Link>
              </li>
              <li>
                <Link href="/prayers" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.9 }}>
                  Catholic Prayers Treasury
                </Link>
              </li>
              <li>
                <Link href="/novenas" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.9 }}>
                  9-Day Novenas Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Area 3: Magisterium & Formation */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-sacred-gold)',
                marginBottom: '1rem',
              }}
            >
              Magisterium & Learning
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <li>
                <Link href="/catechism" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.9 }}>
                  Catechism of the Catholic Church
                </Link>
              </li>
              <li>
                <Link href="/church-documents" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.9 }}>
                  Church Documents & Constitutions
                </Link>
              </li>
              <li>
                <Link href="/learn" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.9 }}>
                  Structured Formation Pathways
                </Link>
              </li>
              <li>
                <Link href="/search" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.9 }}>
                  Universal Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Area 4: Platform & Editorial */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-sacred-gold)',
                marginBottom: '1rem',
              }}
            >
              About & Governance
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <li>
                <Link href="/about" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.9 }}>
                  About CredoCatholica
                </Link>
              </li>
              <li>
                <Link href="/editorial-standards" style={{ fontSize: '0.875rem', color: 'var(--color-sacred-gold)', textDecoration: 'none', fontWeight: 500 }}>
                  Editorial & Doctrinal Governance →
                </Link>
              </li>
              <li>
                <Link href="/privacy" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.7 }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ fontSize: '0.875rem', color: 'var(--color-background)', textDecoration: 'none', opacity: 0.7 }}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Baseline Notice */}
        <div
          style={{
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: 'rgba(245, 240, 232, 0.6)',
          }}
        >
          <p>© {currentYear} CredoCatholica. All rights reserved.</p>
          <p style={{ fontStyle: 'italic' }}>Fidelitas in Doctrina — Truth Preserved</p>
        </div>
      </div>
    </footer>
  );
}
