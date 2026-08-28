# CredoCatholica — Design System & Visual Identity Specification

## 1. Design Philosophy

CredoCatholica's visual identity is built on three core pillars:

```
+-----------------------------------------------------------------------+
| SACRED MINIMALISM  +  LITURGICAL DIGNITY  +  EDITORIAL CLARITY       |
+-----------------------------------------------------------------------+
```

### Visual Tone & Character
- **Calm & Reverent:** High readability, generous whitespace, restrained decoration.
- **Timeless & Catholic:** Elegant serif typography paired with clean, accessible sans-serif body text.
- **Authoritative & Global:** Authoritative editorial hierarchy without startup marketing gimmicks, glassmorphism, floating blobs, or neon gradients.

---

## 2. Color Palette & CSS Custom Properties

Design tokens are defined centrally in [`src/app/globals.css`](file:///c:/Users/acer/Desktop/CredoCatholica/src/app/globals.css) using semantic CSS custom properties.

### Brand Palette Tokens

| Semantic Property | Hex Value | Conceptual Role |
| :--- | :--- | :--- |
| `--color-primary` | `#1a2744` | **Deep Blue Navy** — Dominant brand color, headings, primary buttons, footer |
| `--color-background` | `#f5f0e8` | **Sacred Cream** — Primary page background color |
| `--color-surface` | `#ffffff` | **Pure White** — Cards, elevated containers, search/filter surfaces |
| `--color-surface-elevated` | `#fdfbf7` | **Sacred Off-White** — Secondary section background highlights |
| `--color-accent` | `#6b1f2a` | **Burgundy** — Subtle accent highlights, secondary links |
| `--color-sacred-gold` | `#9a7c3f` | **Muted Gold** — Eyebrow headers, focus rings, border highlights, badging |
| `--color-border` | `#e2dacd` | **Soft Cream Border** — Section dividers and card borders |
| `--color-border-gold` | `#c4a768` | **Accent Gold Border** — Elevated card borders and header accents |
| `--color-text` | `#1a2744` | **Deep Blue Navy** — Primary body text |
| `--color-text-muted` | `#5a6578` | **Muted Slate** — Secondary captions, subtitles, metadata text |

---

## 3. Liturgical Color Tokens

Liturgical color tokens are used strictly as restrained visual presentation accents (borders, badges, labels, calendar badges) and never as full-page background floods.

Controlled CSS classes enforce explicit mapping in [`LiturgicalBadge.tsx`](file:///c:/Users/acer/Desktop/CredoCatholica/src/components/ui/LiturgicalBadge.tsx):

| Canonical `LiturgicalColor` | CSS Class Name | Accent Color | Border / Background Token |
| :--- | :--- | :--- | :--- |
| `GREEN` | `.badge-liturgical-green` | `#1b4332` | Soft Green Tint (`#2d6a4f`) |
| `VIOLET` | `.badge-liturgical-violet` | `#3c2463` | Soft Violet Tint (`#5a3e85`) |
| `WHITE` | `.badge-liturgical-white` | `#1a2744` | Cream / Gold Border (`#c4a768`) |
| `RED` | `.badge-liturgical-red` | `#6b1011` | Soft Red Tint (`#9e2a2b`) |
| `ROSE` | `.badge-liturgical-rose` | `#7a3241` | Soft Rose Tint (`#b56576`) |
| `BLACK` | `.badge-liturgical-black` | `#171825` | Soft Slate Tint (`#2b2d42`) |

---

## 4. Typography System

Integrated via Next.js `next/font/google` in [`src/app/layout.tsx`](file:///c:/Users/acer/Desktop/CredoCatholica/src/app/layout.tsx):

- **Serif Heading Font:** `Cormorant Garamond` (Weights: `400`, `500`, `600`, `700`) — Variable: `--font-serif`
- **Sans-Serif Body Font:** `Inter` (Weights: `400`, `500`, `600`, `700`) — Variable: `--font-sans`

### Typographic Hierarchy

| Role | Font Family | Size | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Heading (H1)** | `var(--font-serif)` | `clamp(1.85rem, 5vw + 0.75rem, 3.25rem)` | 600 | 1.20 |
| **Section Heading (H2)** | `var(--font-serif)` | 2.25rem (36px) | 600 | 1.20 |
| **Card Heading (H3)** | `var(--font-serif)` | 1.375rem (22px) | 600 | 1.25 |
| **Body Text** | `var(--font-sans)` | 1.00rem (16px) | 400 | 1.60 |
| **Subtitles / Lead** | `var(--font-sans)` | 1.0625rem (17px) | 400 / 500 | 1.60 |
| **Eyebrow / Badges** | `var(--font-sans)` | 0.8125rem (13px) | 600 | 1.20 |

---

## 5. Spacing & Layout Constraints

- **Max Container Width:** `72rem` (1152px) via `.container`
- **Section Padding:** `4rem` (desktop) / `2.5rem` (mobile) via `.section-padding`
- **Component Border Radius:** `var(--radius-sm)` (4px) and `var(--radius-md)` (8px)

---

## 6. Accessibility & Responsive Principles

- **Keyboard Navigation:** `:focus-visible` ring styled with `2px solid var(--color-sacred-gold)`.
- **Skip Link:** Accessible `.skip-link` pointing to `<main id="main-content">`.
- **Mobile Menu:** Accessible drawer component handling Escape key press, `aria-expanded` toggle, backdrop overlay, and scroll-lock management without external dependencies.
- **Viewport Bounds:** Tested down to 320px width without horizontal overflow; 200% browser zoom rendering preserved.
