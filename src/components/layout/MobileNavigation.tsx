'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
}

interface MobileNavigationProps {
  items: NavItem[];
}

export function MobileNavigation({ items }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key press (Correction 9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <div className="mobile-nav-wrapper">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-drawer"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        style={{
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.75rem',
          color: 'var(--color-primary)',
          fontSize: '0.9375rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>Menu</span>
        <span aria-hidden="true">{isOpen ? '✕' : '☰'}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(26, 39, 68, 0.4)',
              backdropFilter: 'blur(2px)',
              zIndex: 998,
            }}
          />

          {/* Drawer Menu */}
          <div
            id="mobile-menu-drawer"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '80%',
              maxWidth: '20rem',
              height: '100vh',
              backgroundColor: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border)',
              padding: '2rem 1.5rem',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '1.5rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                }}
              >
                CredoCatholica
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            </div>

            <nav aria-label="Mobile Navigation">
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.5rem 0',
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                Daily Liturgical Companion & Permanent Reference Library
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
