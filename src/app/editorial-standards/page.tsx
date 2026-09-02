import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Standards & Content Governance — CredoCatholica',
  description: 'CredoCatholica enforces strict editorial standards, content accuracy, traditional prayer protection, and source provenance for Catholic content.',
};

export default function EditorialStandardsPage() {
  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '46rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
        <p style={{ color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Doctrinal Integrity
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', margin: '0 0 1rem' }}>
          Editorial Standards & Governance
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
          Accuracy &gt; Speed • Fidelity &gt; Creativity • Clarity &gt; Engagement
        </p>
      </header>

      <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--color-primary)', display: 'grid', gap: '1.5rem' }}>
        <section>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            1. Absolute Content Integrity
          </h2>
          <p>
            Catholic content accuracy is safety-critical. CredoCatholica strictly prohibits the autonomous rewriting of canonical Catholic prayers, the paraphrasing of Scripture stored as canonical reading text, the alteration of Rosary mysteries, or the fabrication of saint legends, apparitions, or indulgences.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            2. Biblical Translation
          </h2>
          <p>
            The default Scripture translation for English readings on CredoCatholica is the historic public-domain Douay-Rheims Bible (Challoner Revision). Scripture texts are preserved in their exact punctuation, verse division, and traditional spelling.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            3. Provenance & Source Attribution
          </h2>
          <p>
            Every Saint biography, prayer formula, novena, Catechism reference, and Church document record maintains documented source provenance, identifying its issuing authority, publication date, and copyright/rights status.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            4. Universal & Free Access
          </h2>
          <p>
            Catholic prayer, Scripture readings, and magisterial reference material on CredoCatholica will never be placed behind a paywall. Faith is received freely and communicated freely for the glory of God.
          </p>
        </section>
      </div>
    </article>
  );
}
