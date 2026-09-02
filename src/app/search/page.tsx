import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { performGlobalSearch } from '@/lib/search/service';

export const metadata: Metadata = {
  title: 'Search Library & Devotions — CredoCatholica',
  description: 'Search across Catholic saints, traditional prayers, 9-day novenas, Catechism entries, Church documents, and formation pathways on CredoCatholica.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || '';

  const results = query.length >= 2 ? await performGlobalSearch(query) : [];

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '48rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <p
          style={{
            color: 'var(--color-secondary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
          }}
        >
          Universal Search
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 1rem',
          }}
        >
          Search CredoCatholica
        </h1>
        <p
          style={{
            maxWidth: '36rem',
            margin: '0 auto 1.5rem',
            color: 'var(--color-text-muted)',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
          }}
        >
          Search saints, prayers, novenas, Catechism paragraphs, Church documents, and formation topics.
        </p>

        {/* Search Bar Input Form */}
        <form action="/search" method="GET" style={{ display: 'flex', gap: '0.5rem', maxWidth: '32rem', margin: '0 auto' }}>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by saint, prayer, topic, or keyword..."
            required
            minLength={2}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              fontSize: '1rem',
              color: 'var(--color-primary)',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9375rem',
            }}
          >
            Search
          </button>
        </form>
      </header>

      {/* Results List */}
      {query && (
        <section>
          <h2 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
            Results for "{query}" ({results.length})
          </h2>

          {results.length === 0 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.0625rem', margin: 0 }}>
                No matching Catholic records found for "{query}". Try searching with a saint’s name, prayer title, or keyword like "Eucharist", "Mary", or "Mercy".
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {results.map((item) => (
                <article
                  key={`${item.type}-${item.id}`}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-secondary)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {item.typeLabel}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.25rem',
                      margin: '0 0 0.5rem',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Link href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.title}
                    </Link>
                  </h3>

                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                    {item.snippet}
                  </p>

                  <Link href={item.href} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}>
                    View Record →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
