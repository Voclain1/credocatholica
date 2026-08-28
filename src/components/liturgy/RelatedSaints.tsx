import React from 'react';
import { RelatedSaintSummary } from '@/lib/liturgy/service';

interface RelatedSaintsProps {
  saint: RelatedSaintSummary;
}

export function RelatedSaints({ saint }: RelatedSaintsProps) {
  const formatEcclesialStatus = (status: string) => {
    return status
      .split('_')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 0.875rem',
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(154, 124, 63, 0.15)',
          color: 'var(--color-sacred-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 700,
        }}
      >
        ✦
      </span>
      <div>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', display: 'block' }}>
          {saint.name}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {formatEcclesialStatus(saint.ecclesialStatus)} {saint.titleTeaser ? `• ${saint.titleTeaser}` : ''}
        </span>
      </div>
    </div>
  );
}
