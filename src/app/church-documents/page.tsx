import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DocumentType } from '@/generated/prisma/client';

export const metadata: Metadata = {
  title: 'Church Documents Treasury — Conciliar & Papal Magisterium',
  description:
    'Explore authoritative Church documents, Vatican II conciliar constitutions, papal encyclicals, and apostolic exhortations on CredoCatholica.',
};

export default async function ChurchDocumentsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeFilter = params.type?.trim().toUpperCase() || '';

  const whereClause: any = {
    publicationStatus: 'PUBLISHED',
  };

  if (typeFilter && Object.values(DocumentType).includes(typeFilter as DocumentType)) {
    whereClause.documentType = typeFilter as DocumentType;
  }

  const documents = await prisma.churchDocument.findMany({
    where: whereClause,
    orderBy: { title: 'asc' },
  });

  const docTypes: { key: DocumentType; label: string }[] = [
    { key: 'COUNCIL_CONSTITUTION', label: 'Conciliar Constitutions' },
    { key: 'ENCYCLICAL', label: 'Encyclicals' },
    { key: 'APOSTOLIC_EXHORTATION', label: 'Apostolic Exhortations' },
    { key: 'APOSTOLIC_LETTER', label: 'Apostolic Letters' },
    { key: 'APOSTOLIC_CONSTITUTION', label: 'Apostolic Constitutions' },
    { key: 'BULL', label: 'Papal Bulls' },
    { key: 'MOTU_PROPRIO', label: 'Motu Proprio' },
    { key: 'CATECHISM', label: 'Catechetical Documents' },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
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
          Magisterial Treasury
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0 0 1rem',
          }}
        >
          Church Documents & Magisterium
        </h1>
        <p
          style={{
            maxWidth: '42rem',
            margin: '0 auto',
            color: 'var(--color-text-muted)',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
          }}
        >
          A canonical reference repository of solemn conciliar constitutions, papal encyclicals, apostolic letters, and magisterial declarations.
        </p>
      </header>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <Link
          href="/church-documents"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid var(--color-border)',
            backgroundColor: !typeFilter ? 'var(--color-primary)' : 'var(--color-surface)',
            color: !typeFilter ? '#ffffff' : 'var(--color-primary)',
          }}
        >
          All Documents
        </Link>
        {docTypes.map((dt) => (
          <Link
            key={dt.key}
            href={`/church-documents?type=${dt.key}`}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid var(--color-border)',
              backgroundColor: typeFilter === dt.key ? 'var(--color-primary)' : 'var(--color-surface)',
              color: typeFilter === dt.key ? '#ffffff' : 'var(--color-primary)',
            }}
          >
            {dt.label}
          </Link>
        ))}
      </div>

      {/* Documents List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {documents.map((doc) => (
          <article
            key={doc.id}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                  }}
                >
                  {doc.documentType.replace(/_/g, ' ')}
                </span>
                {doc.latinTitle && (
                  <span style={{ fontSize: '0.8125rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                    {doc.latinTitle}
                  </span>
                )}
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.375rem',
                  margin: '0 0 0.5rem',
                  color: 'var(--color-primary)',
                }}
              >
                <Link href={`/church-documents/${doc.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {doc.title}
                </Link>
              </h2>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                {doc.issuingAuthority}
              </p>

              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--color-text)',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {doc.summary}
              </p>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Link
                href={`/church-documents/${doc.slug}`}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                }}
              >
                Read Document Record →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
