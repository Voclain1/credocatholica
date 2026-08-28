import React from 'react';
import { LiturgicalColor, LiturgicalSeason, YearCycle, WeekdayCycle } from '@/generated/prisma/client';
import { LiturgicalBadge } from '@/components/ui/LiturgicalBadge';
import { LiturgicalRequirement } from './LiturgicalRequirement';

interface LiturgicalDayHeaderProps {
  formattedDate: string;
  season: LiturgicalSeason;
  seasonWeek?: number | null;
  yearCycle: YearCycle;
  weekdayCycle: WeekdayCycle;
  liturgicalColor: LiturgicalColor;
  gloriaRequired: boolean;
  creedRequired: boolean;
  notes?: string | null;
}

export function LiturgicalDayHeader({
  formattedDate,
  season,
  seasonWeek,
  yearCycle,
  weekdayCycle,
  liturgicalColor,
  gloriaRequired,
  creedRequired,
  notes,
}: LiturgicalDayHeaderProps) {
  const formattedYearCycle = yearCycle.replace('_', ' ');
  const formattedWeekdayCycle = weekdayCycle.replace('_', ' ');

  return (
    <header
      style={{
        paddingBottom: '2rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-sacred-gold)',
              display: 'block',
              marginBottom: '0.25rem',
            }}
          >
            {formattedDate}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.5rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              lineHeight: 1.15,
            }}
          >
            {season.name} {seasonWeek ? `— Week ${seasonWeek}` : ''}
          </h1>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <LiturgicalBadge color={liturgicalColor} label={season.name} />
          <LiturgicalRequirement gloriaRequired={gloriaRequired} creedRequired={creedRequired} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          paddingTop: '0.75rem',
        }}
      >
        <span>
          <strong>Sunday Cycle:</strong> {formattedYearCycle}
        </span>
        <span aria-hidden="true">•</span>
        <span>
          <strong>Weekday Cycle:</strong> {formattedWeekdayCycle}
        </span>
      </div>

      {notes && (
        <p
          style={{
            marginTop: '1rem',
            padding: '0.875rem 1.125rem',
            backgroundColor: 'var(--color-surface-elevated)',
            borderLeft: '3px solid var(--color-sacred-gold)',
            fontSize: '0.9375rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          {notes}
        </p>
      )}
    </header>
  );
}
