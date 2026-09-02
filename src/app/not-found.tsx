import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center', maxWidth: '36rem' }}>
      <p style={{ color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.875rem' }}>
        404 — Page Not Found
      </p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', margin: '0.5rem 0 1rem' }}>
        Record Not Found
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        The requested page, saint profile, prayer, or reference document could not be located in the CredoCatholica repository.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-primary)', color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>
          Return Home
        </Link>
        <Link href="/today" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Today&apos;s Liturgy
        </Link>
      </div>
    </div>
  );
}
