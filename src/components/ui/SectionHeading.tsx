import React from 'react';

interface SectionHeadingProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeading({ title, eyebrow, subtitle, centered = false }: SectionHeadingProps) {
  const alignClass = centered ? 'text-center' : '';

  return (
    <div className={`mb-8 ${alignClass}`.trim()} style={{ textAlign: centered ? 'center' : 'left' }}>
      {eyebrow && (
        <span
          style={{
            display: 'block',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-sacred-gold)',
            marginBottom: '0.375rem',
          }}
        >
          {eyebrow}
        </span>
      )}
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.25rem',
          fontWeight: 600,
          color: 'var(--color-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            marginTop: '0.5rem',
            fontSize: '1.0625rem',
            color: 'var(--color-text-muted)',
            maxWidth: centered ? '36rem' : '100%',
            marginLeft: centered ? 'auto' : '0',
            marginRight: centered ? 'auto' : '0',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
