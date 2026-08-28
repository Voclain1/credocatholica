import React from 'react';
import Link from 'next/link';
import { MobileNavigation } from './MobileNavigation';

const NAV_ITEMS = [
  { label: 'Today', href: '/#today' },
  { label: 'Library', href: '/#library' },
  { label: 'Formation', href: '/#formation' },
  { label: 'Editorial Standards', href: '/#editorial-standards' },
];

export function SiteHeader() {
  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
        }}
      >
        {/* Brand Identity / Wordmark (Correction 14: Single textual identity "CredoCatholica") */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.625rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <span>CredoCatholica</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="desktop-nav">
          <ul
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.75rem',
              listStyle: 'none',
            }}
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="mobile-nav-trigger">
          <MobileNavigation items={NAV_ITEMS} />
        </div>
      </div>

      <style>{`
        .desktop-nav {
          display: flex;
        }
        .mobile-nav-trigger {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-trigger {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
