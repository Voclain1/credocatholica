import React from 'react';

interface LiturgicalRequirementProps {
  gloriaRequired: boolean;
  creedRequired: boolean;
}

export function LiturgicalRequirement({ gloriaRequired, creedRequired }: LiturgicalRequirementProps) {
  if (!gloriaRequired && !creedRequired) {
    return null;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
      }}
    >
      {gloriaRequired && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            backgroundColor: 'rgba(154, 124, 63, 0.12)',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-border-gold)',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: '0.625rem', color: 'var(--color-sacred-gold)' }}>
            ✦
          </span>
          <span>Gloria</span>
        </span>
      )}

      {creedRequired && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            backgroundColor: 'rgba(26, 39, 68, 0.08)',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: '0.625rem', color: 'var(--color-primary)' }}>
            ✝
          </span>
          <span>Creed</span>
        </span>
      )}
    </div>
  );
}
