import React from 'react';

interface LiturgicalEmptyStateProps {
  formattedDate: string;
}

export function LiturgicalEmptyState({ formattedDate }: LiturgicalEmptyStateProps) {
  return (
    <div
      style={{
        padding: '4rem 2rem',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        maxWidth: '42rem',
        margin: '2rem auto',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '3.5rem',
          height: '3.5rem',
          margin: '0 auto 1.25rem auto',
          borderRadius: '50%',
          backgroundColor: 'rgba(154, 124, 63, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-sacred-gold)',
          fontSize: '1.5rem',
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
        }}
      >
        ✦
      </div>

      <span
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-sacred-gold)',
          display: 'block',
          marginBottom: '0.5rem',
        }}
      >
        {formattedDate}
      </span>

      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.875rem',
          fontWeight: 600,
          color: 'var(--color-primary)',
          marginBottom: '0.75rem',
        }}
      >
        Daily Liturgical Companion
      </h2>

      <p
        style={{
          fontSize: '1rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
        }}
      >
        Verified canonical liturgical readings, celebrations, and sanctoral observances for this calendar date are currently under preparation according to CredoCatholica editorial standards.
      </p>

      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
        }}
      >
        Canonical Scripture text is sourced exclusively from the public domain Douay-Rheims Bible and verified Roman Catholic liturgical sources.
      </div>
    </div>
  );
}
