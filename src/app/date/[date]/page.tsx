import React from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { getLiturgicalDayByDate } from '@/lib/liturgy/service';
import { LiturgicalDayHeader } from '@/components/liturgy/LiturgicalDayHeader';
import { CelebrationSummary } from '@/components/liturgy/CelebrationSummary';
import { ReadingSection } from '@/components/liturgy/ReadingSection';
import { PsalmSection } from '@/components/liturgy/PsalmSection';
import { LiturgicalEmptyState } from '@/components/liturgy/LiturgicalEmptyState';
import { ReadingType } from '@/generated/prisma/client';

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Liturgy for ${date} | CredoCatholica`,
    description: `Daily liturgical companion, Scripture readings, and observances for ${date} in the Universal Roman Calendar.`,
  };
}

export default async function LiturgicalDatePage({ params }: Props) {
  const { date } = await params;
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    return (
      <Container>
        <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>Invalid Date Format</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Please specify a valid date in YYYY-MM-DD format.</p>
        </div>
      </Container>
    );
  }

  const result = await getLiturgicalDayByDate(targetDate);

  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <Container>
        {result.status === 'FOUND' ? (
          <main id="liturgical-content" aria-label={`Liturgical Readings for ${date}`}>
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

            <CelebrationSummary
              principalCelebration={result.data.principalCelebration}
              secondaryCelebrations={result.data.secondaryCelebrations}
            />

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
          </main>
        ) : (
          <LiturgicalEmptyState formattedDate={date} />
        )}
      </Container>
    </div>
  );
}
