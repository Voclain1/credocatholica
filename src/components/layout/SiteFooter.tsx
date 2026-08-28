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
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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

          {/* Area 2: Platform Navigation */}
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
              Platform Navigation
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <li>
                <Link
                  href="/today"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-background)',
                    textDecoration: 'none',
                    opacity: 0.9,
                  }}
                >
                  Today&apos;s Liturgy
                </Link>
              </li>
              <li>
                <Link
                  href="/#library"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-background)',
                    textDecoration: 'none',
                    opacity: 0.9,
                  }}
                >
                  Catholic Reference Library
                </Link>
              </li>
              <li>
                <Link
                  href="/#formation"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-background)',
                    textDecoration: 'none',
                    opacity: 0.9,
                  }}
                >
                  Structured Formation Pathways
                </Link>
              </li>
            </ul>
          </div>

          {/* Area 3: Editorial Standards & Accuracy */}
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
              Editorial Integrity
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(245, 240, 232, 0.75)',
                lineHeight: 1.6,
                marginBottom: '0.75rem',
              }}
            >
              Canonical texts preserved using public domain Douay-Rheims Scripture and verified Catholic magisterial sources.
            </p>
            <Link
              href="/#editorial-standards"
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-sacred-gold)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              View Editorial Standards &rarr;
            </Link>
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
