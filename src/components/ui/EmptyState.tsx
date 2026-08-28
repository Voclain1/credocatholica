import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'Content Under Preparation',
  message = 'Content for this section is being prepared according to CredoCatholica editorial standards.',
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '3rem 2rem',
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        maxWidth: '36rem',
        margin: '0 auto',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '3rem',
          height: '3rem',
          margin: '0 auto 1rem auto',
          borderRadius: '50%',
          backgroundColor: 'rgba(154, 124, 63, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-sacred-gold)',
          fontSize: '1.25rem',
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
        }}
      >
        ✦
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--color-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
    </div>
  );
}
