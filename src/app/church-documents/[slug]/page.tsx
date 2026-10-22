import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { correctOfficialDocumentUrl } from '@/lib/content/document-sources';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await prisma.churchDocument.findUnique({ where: { slug } });
  if (!doc) return { title: 'Document Not Found' };

  return {
    title: `${doc.title} — Catholic Church Document`,
    description: doc.summary,
  };
}

export default async function ChurchDocumentDetailPage({ params }: Props) {
  const { slug } = await params;

  const doc = await prisma.churchDocument.findUnique({
    where: { slug },
    include: {
      formationLessons: {
        include: { module: { include: { pathway: true } } },
      },
    },
  });

  if (!doc || doc.publicationStatus !== 'PUBLISHED') {
    notFound();
  }
  const officialUrl = correctOfficialDocumentUrl(doc.officialUrl);

  return (
    <article className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '48rem' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link href="/church-documents" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 500 }}>
          ← Church Documents Index
        </Link>
      </nav>

      {/* Main Header */}
      <header style={{ marginBottom: '2.5rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            display: 'inline-block',
            marginBottom: '0.75rem',
          }}
        >
          {doc.documentType.replace(/_/g, ' ')}
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 0.5rem',
          }}
        >
          {doc.title}
        </h1>

        {doc.latinTitle && (
          <p style={{ fontSize: '1.125rem', fontStyle: 'italic', color: 'var(--color-secondary)', margin: '0 0 0.5rem' }}>
            {doc.latinTitle}
          </p>
        )}

        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Authority: <strong>{doc.issuingAuthority}</strong>
        </p>
      </header>

      {/* Summary Box */}
      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Editorial Summary
        </h2>
        <p style={{ fontSize: '1.0625rem', lineHeight: 1.6, color: 'var(--color-text)', margin: 0 }}>
          {doc.summary}
        </p>
      </section>

      {/* Opening Excerpt */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
          Stored Reference Text
        </h2>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            lineHeight: 1.8,
            color: 'var(--color-primary)',
            padding: '1.5rem',
            backgroundColor: 'var(--color-background)',
            borderLeft: '4px solid var(--color-secondary)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {doc.bodyText}
        </div>
      </section>

      {/* Official Vatican Link */}
      {officialUrl && (
        <section style={{ marginBottom: '2.5rem' }}>
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9375rem',
            }}
          >
            Read Full Official Text on Vatican.va ↗
          </a>
        </section>
      )}

      {/* Related Formation Lessons */}
      {doc.formationLessons.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            Related Formation Lessons
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {doc.formationLessons.map((l) => (
              <div
                key={l.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                  {l.module.pathway.title}
                </span>
                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', margin: '0.25rem 0 0.5rem', color: 'var(--color-primary)' }}>
                  <Link href={`/learn/${l.module.pathway.slug}/${l.module.slug}/${l.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {l.title}
                  </Link>
                </h3>
                <Link
                  href={`/learn/${l.module.pathway.slug}/${l.module.slug}/${l.slug}`}
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', textDecoration: 'none' }}
                >
                  Study Lesson →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
