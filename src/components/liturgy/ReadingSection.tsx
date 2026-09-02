import React from 'react';
import { PresentationReading } from '@/lib/liturgy/service';

interface ReadingSectionProps {
  reading: PresentationReading;
}

export function ReadingSection({ reading }: ReadingSectionProps) {
  const isGospel = reading.type === 'GOSPEL';
  const isGospelAcclamation = reading.type === 'GOSPEL_ACCLAMATION';

  const formatTypeTitle = (type: string): string => {
    switch (type) {
      case 'FIRST_READING':
        return 'First Reading';
      case 'SECOND_READING':
        return 'Second Reading';
      case 'GOSPEL_ACCLAMATION':
        return 'Gospel Acclamation';
      case 'GOSPEL':
        return 'The Holy Gospel';
      case 'OTHER':
        return 'Reading';
      default:
        return 'Scripture Reading';
    }
  };

  const typeTitle = formatTypeTitle(reading.type);

  return (
    <article
      className={`reading-article ${isGospel ? 'gospel-article' : ''}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: isGospel ? '1px solid var(--color-border-gold)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: isGospel ? '0 3px 10px rgba(154, 124, 63, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
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
              color: isGospel ? 'var(--color-sacred-gold)' : 'var(--color-text-muted)',
              display: 'block',
              marginBottom: '0.25rem',
            }}
          >
            {typeTitle}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isGospel ? '1.75rem' : '1.5rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
            }}
          >
            {reading.citationRef}
          </h2>
        </div>

        {isGospel && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--color-sacred-gold)',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(154, 124, 63, 0.1)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Evangelium
          </span>
        )}
      </header>

      {/* Optional Acclamation Refrain */}
      {isGospelAcclamation && reading.response && (
        <div
          style={{
            marginBottom: '1rem',
            fontStyle: 'italic',
            fontWeight: 600,
            color: 'var(--color-sacred-gold)',
          }}
        >
          R. {reading.response}
        </div>
      )}

      {/* Scripture Text or Incomplete State */}
      {reading.text ? (
        <div
          className="scripture-text"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: isGospel ? '1.1875rem' : '1.125rem',
            lineHeight: 1.7,
            color: 'var(--color-text)',
            whiteSpace: 'pre-line',
            maxWidth: '44rem',
          }}
        >
          {reading.text}
        </div>
      ) : (
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9375rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}
        >
          Canonical text for this reading selection is being verified according to editorial standards.
        </div>
      )}

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
