import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — CredoCatholica',
  description: 'Privacy Policy for CredoCatholica digital companion platform.',
};

export default function PrivacyPage() {
  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '46rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', margin: 0 }}>
          Privacy Policy
        </h1>
      </header>
      <div style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-primary)' }}>
        <p>CredoCatholica values user privacy. We do not track personal identities or sell user data. This application operates as a quiet digital reference companion.</p>
        <p>Standard web server logs may collect technical diagnostics (IP address, user agent) solely for security, performance monitoring, and service reliability.</p>
      </div>
    </article>
  );
}
