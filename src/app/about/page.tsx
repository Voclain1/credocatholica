import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About CredoCatholica — Mission & Sacred Identity',
  description: 'CredoCatholica is a global Catholic digital platform providing daily liturgical companionship, a permanent Catholic reference library, and structured formation pathways.',
};

export default function AboutPage() {
  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '46rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
        <p style={{ color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Mission & Foundation
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', margin: '0 0 1rem' }}>
          About CredoCatholica
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
          Faith Received. Truth Preserved. Life Formed.
        </p>
      </header>

      <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--color-primary)', display: 'grid', gap: '1.5rem' }}>
        <section>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Our Purpose
          </h2>
          <p>
            CredoCatholica was established to provide the global Catholic faithful with an uncompromised, beautiful, and reliable digital companion. Built on a structured domain architecture, the platform unifies daily Mass readings, hagiography, traditional prayer formulas, and magisterial reference documents into a single reverent interface.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Three Core Pillars
          </h2>
          <ul>
            <li><strong>Daily Liturgical Companion:</strong> Providing exact scripture readings and liturgical celebration data according to the Universal Roman Calendar.</li>
            <li><strong>Permanent Reference Library:</strong> A canonical repository of Saints, traditional prayers, 9-day novenas, and Magisterial Church documents.</li>
            <li><strong>Structured Formation Pathways:</strong> Guided learning journeys rooted in the Catechism of the Catholic Church.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Sacred Minimalism & Readability
          </h2>
          <p>
            In contrast to commercial software and noisy media grids, CredoCatholica adheres to a philosophy of sacred minimalism: quiet typography, dignified liturgical colors (Deep Blue `#1a2744`, Sacred Cream `#f5f0e8`, Burgundy `#6b1f2a`, Muted Gold `#9a7c3f`), generous whitespace, and absolute reverence for sacred texts.
          </p>
        </section>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <Link href="/editorial-standards" style={{ fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}>
            Read Our Editorial & Doctrinal Standards →
          </Link>
        </div>
      </div>
    </article>
  );
}
