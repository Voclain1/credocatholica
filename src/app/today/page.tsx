import React from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { getTodayLiturgicalDay } from '@/lib/liturgy/service';
import { LiturgicalDayHeader } from '@/components/liturgy/LiturgicalDayHeader';
import { CelebrationSummary } from '@/components/liturgy/CelebrationSummary';
import { ReadingSection } from '@/components/liturgy/ReadingSection';
import { PsalmSection } from '@/components/liturgy/PsalmSection';
import { DailyReflectionPreview } from '@/components/liturgy/DailyReflectionPreview';
import { LiturgicalEmptyState } from '@/components/liturgy/LiturgicalEmptyState';
import { ReadingType } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Today's Liturgy | CredoCatholica",
  description:
    'Canonical daily liturgical companion providing Scripture readings, liturgical celebrations, and sanctoral observances for the Universal Roman Calendar.',
  openGraph: {
    title: "Today's Liturgy | CredoCatholica",
    description:
      'Canonical daily liturgical companion providing Scripture readings, liturgical celebrations, and sanctoral observances.',
    type: 'website',
  },
};

export default async function TodayPage() {
  // Fetch today's liturgical day record via domain service
  const result = await getTodayLiturgicalDay();

  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <Container>
        {result.status === 'FOUND' ? (
          <main id="liturgical-content" aria-label="Daily Liturgical Readings and Observances">
            {/* Header: Date, Season, Cycles, Color, Requirements */}
            <LiturgicalDayHeader
              formattedDate={result.data.formattedDate}
              season={result.data.season}
              seasonWeek={result.data.seasonWeek}
              yearCycle={result.data.yearCycle}
              weekdayCycle={result.data.weekdayCycle}
              liturgicalColor={result.data.liturgicalColor}
              gloriaRequired={result.data.gloriaRequired}
              creedRequired={result.data.creedRequired}
              notes={result.data.notes}
            />

            {/* Celebrations: Principal & Secondary */}
            <CelebrationSummary
              principalCelebration={result.data.principalCelebration}
              secondaryCelebrations={result.data.secondaryCelebrations}
            />

            {/* Ordered Mass Readings */}
            {result.data.readings.length > 0 && (
              <section aria-label="Liturgical Scripture Readings" style={{ marginTop: '2.5rem' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.75rem',
                    color: 'var(--color-primary)',
                    marginBottom: '1.5rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '2px solid var(--color-sacred-gold)',
                  }}
                >
                  Mass Readings
                </h2>

                {result.data.readings.map((reading) =>
                  reading.type === ReadingType.RESPONSORIAL_PSALM ? (
                    <PsalmSection key={reading.id} reading={reading} />
                  ) : (
                    <ReadingSection key={reading.id} reading={reading} />
                  )
                )}
              </section>
            )}

            {/* Spiritual Reflection Preview */}
            {result.data.reflections.length > 0 && (
              <DailyReflectionPreview reflections={result.data.reflections} />
            )}
          </main>
        ) : result.status === 'ERROR' ? (
          <EmptyState
            title="Liturgical Service Temporarily Unavailable"
            message="The daily liturgical query service encountered a temporary error. Please try again shortly."
          />
        ) : (
          <LiturgicalEmptyState formattedDate={result.formattedDate} />
        )}
      </Container>
    </div>
  );
}
