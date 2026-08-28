import React from 'react';
import { PresentationReading } from '@/lib/liturgy/service';

interface PsalmSectionProps {
  reading: PresentationReading;
}

export function PsalmSection({ reading }: PsalmSectionProps) {
  return (
    <article
      className="reading-article psalm-article"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-sacred-gold)',
              display: 'block',
              marginBottom: '0.25rem',
            }}
          >
            Responsorial Psalm
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
            }}
          >
            {reading.citationRef}
          </h2>
        </div>
      </header>

      {/* Psalm Response (Clearly distinguished) */}
      {reading.response && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--color-surface-elevated)',
            borderLeft: '4px solid var(--color-sacred-gold)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-sacred-gold)',
              display: 'block',
              marginBottom: '0.25rem',
            }}
          >
            Responsorial Refrain
          </span>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              lineHeight: 1.4,
              fontStyle: 'italic',
            }}
          >
            R. {reading.response}
          </p>
        </div>
      )}

      {/* Psalm Text */}
      <div
        className="scripture-text"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.125rem',
          lineHeight: 1.7,
          color: 'var(--color-text)',
          whiteSpace: 'pre-line',
          maxWidth: '44rem',
        }}
      >
        {reading.text}
      </div>

      <footer
        style={{
          marginTop: '1.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px dotted var(--color-border)',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
        }}
      >
        {reading.copyrightInfo}
      </footer>
    </article>
  );
}
