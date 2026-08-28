import React from 'react';
import Link from 'next/link';

interface EditorialLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'subtle';
  className?: string;
}

export function EditorialLink({ href, children, variant = 'primary', className = '' }: EditorialLinkProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '0.9375rem',
    textDecoration: 'none',
    transition: 'all 0.15s ease-in-out',
    borderRadius: 'var(--radius-sm)',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-background)',
      padding: '0.75rem 1.375rem',
      border: '1px solid var(--color-primary)',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      padding: '0.75rem 1.375rem',
      border: '1px solid var(--color-sacred-gold)',
    },
    subtle: {
      backgroundColor: 'transparent',
      color: 'var(--color-accent)',
      padding: '0',
      border: 'none',
    },
  };

  return (
    <Link href={href} style={{ ...baseStyle, ...variantStyles[variant] }} className={className}>
      <span>{children}</span>
      <span aria-hidden="true" style={{ fontSize: '1em', lineHeight: 1 }}>
        &rarr;
      </span>
    </Link>
  );
}
