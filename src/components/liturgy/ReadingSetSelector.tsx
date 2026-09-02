'use client';

import React, { useState } from 'react';
import { PresentationReadingSet } from '@/lib/liturgy/service';
import { ReadingSection } from './ReadingSection';
import { PsalmSection } from './PsalmSection';

interface ReadingSetSelectorProps {
  readingSets: PresentationReadingSet[];
}

export function ReadingSetSelector({ readingSets }: ReadingSetSelectorProps) {
  if (!readingSets || readingSets.length === 0) return null;

  // Find canonical default set or fallback to first set
  const defaultSet = readingSets.find((s) => s.isCanonicalDefault) || readingSets[0];
  const [selectedSetId, setSelectedSetId] = useState<string>(defaultSet.id);

  const activeSet = readingSets.find((s) => s.id === selectedSetId) || defaultSet;

  const formatSetLabel = (set: PresentationReadingSet) => {
    if (set.label) return set.label;
    switch (set.context) {
      case 'PROPER_OF_SAINTS':
        return 'Sanctoral Proper (Feast / Memorial)';
      case 'PROPER_OF_SEASON':
        return 'Proper of Season';
      case 'WEEKDAY':
        return 'Weekday Lectionary';
      case 'SUNDAY':
        return 'Sunday Lectionary';
      default:
        return `Lectionary Option ${set.setOrder}`;
    }
  };

  return (
    <section aria-label="Liturgical Scripture Readings" style={{ marginTop: '2.5rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid var(--color-sacred-gold)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            color: 'var(--color-primary)',
            margin: 0,
          }}
        >
          Mass Readings
        </h2>

        {/* Tab Selector for Multiple ReadingSets */}
        {readingSets.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {readingSets.map((set) => {
              const isSelected = set.id === activeSet.id;
              return (
                <button
                  key={set.id}
                  onClick={() => setSelectedSetId(set.id)}
                  type="button"
                  style={{
                    padding: '0.4rem 0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isSelected ? '#ffffff' : 'var(--color-primary)',
                    border: isSelected
                      ? '1px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {formatSetLabel(set)}
                  {set.isCanonicalDefault && (
                    <span
                      style={{
                        marginLeft: '0.375rem',
                        fontSize: '0.7rem',
                        opacity: isSelected ? 0.9 : 0.7,
                        textTransform: 'uppercase',
                      }}
                    >
                      (Default)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Description of active set if present */}
      {activeSet.description && (
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-surface-elevated)',
            borderLeft: '3px solid var(--color-sacred-gold)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {activeSet.description}
        </p>
      )}

      {/* Render all readings for the active set */}
      {activeSet.readings.map((reading) =>
        reading.type === 'RESPONSORIAL_PSALM' ? (
          <PsalmSection key={reading.id} reading={reading} />
        ) : (
          <ReadingSection key={reading.id} reading={reading} />
        )
      )}
    </section>
  );
}
