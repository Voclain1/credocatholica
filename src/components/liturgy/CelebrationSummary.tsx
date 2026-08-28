import React from 'react';
import { PresentationCelebration } from '@/lib/liturgy/service';
import { LiturgicalBadge } from '@/components/ui/LiturgicalBadge';
import { RelatedSaints } from './RelatedSaints';

interface CelebrationSummaryProps {
  principalCelebration?: PresentationCelebration | null;
  secondaryCelebrations: PresentationCelebration[];
}

export function CelebrationSummary({
  principalCelebration,
  secondaryCelebrations,
}: CelebrationSummaryProps) {
  if (!principalCelebration && secondaryCelebrations.length === 0) {
    return null;
  }

  const formatRank = (rank: string) => {
    return rank
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <section
      aria-label="Liturgical Celebrations"
      style={{
        marginBottom: '2.5rem',
      }}
    >
      {/* Principal Celebration */}
      {principalCelebration && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            marginBottom: secondaryCelebrations.length > 0 ? '1.25rem' : '0',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-sacred-gold)',
              }}
            >
              Principal Celebration — {formatRank(principalCelebration.rank)}
            </span>

            {principalCelebration.color && (
              <LiturgicalBadge
                color={principalCelebration.color}
                label={principalCelebration.color}
              />
            )}
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              marginBottom: '0.5rem',
            }}
          >
            {principalCelebration.title}
          </h2>

          {principalCelebration.biographySummary && (
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                marginTop: '0.75rem',
              }}
            >
              {principalCelebration.biographySummary}
            </p>
          )}

          {principalCelebration.saint && (
            <div style={{ marginTop: '1rem' }}>
              <RelatedSaints saint={principalCelebration.saint} />
            </div>
          )}
        </div>
      )}

      {/* Secondary & Optional Celebrations */}
      {secondaryCelebrations.length > 0 && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted)',
              marginBottom: '0.75rem',
            }}
          >
            Secondary & Optional Observances
          </h3>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {secondaryCelebrations.map((cel) => (
              <li
                key={cel.id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid rgba(226, 218, 205, 0.5)',
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}
                  >
                    {cel.title}
                  </span>
                  {cel.isOptional && (
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      (Optional Memorial)
                    </span>
                  )}
                  {cel.isCommemoration && (
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      (Commemoration)
                    </span>
                  )}
                </div>

                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {formatRank(cel.rank)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
