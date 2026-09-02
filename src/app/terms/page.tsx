import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — CredoCatholica',
  description: 'Terms of Service for CredoCatholica digital companion platform.',
};

export default function TermsPage() {
  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '46rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', margin: 0 }}>
          Terms of Service
        </h1>
      </header>
      <div style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-primary)' }}>
        <p>By accessing CredoCatholica, you agree to use the platform in a spirit of reverence and respect. Liturgical readings, prayer formulas, and reference materials are provided for spiritual enrichment, catechesis, and devotion.</p>
        <p>All canonical texts, traditional prayers, and magisterial documents are preserved in accordance with Catholic tradition and applicable public-domain/copyright laws.</p>
      </div>
    </article>
  );
}
