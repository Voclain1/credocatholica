import React from 'react';
import { PresentationReflection } from '@/lib/liturgy/service';

interface DailyReflectionPreviewProps {
  reflections: PresentationReflection[];
}

export function DailyReflectionPreview({ reflections }: DailyReflectionPreviewProps) {
  if (reflections.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Daily Liturgical Reflection"
      style={{
        marginTop: '2.5rem',
        padding: '2rem',
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
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
        Spiritual Reflection
      </span>

      {reflections.map((ref) => (
        <div key={ref.id}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              color: 'var(--color-primary)',
              marginBottom: '0.375rem',
            }}
          >
            {ref.title}
          </h3>

          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              display: 'block',
              marginBottom: '1rem',
              fontStyle: 'italic',
            }}
          >
            By {ref.author}
          </span>

          <div
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text)',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
            }}
          >
            {ref.bodyText}
          </div>
        </div>
      ))}
    </section>
  );
}
