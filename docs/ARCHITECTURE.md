# CredoCatholica — Technical Architecture Specification

## 1. Current Migration Phase

**Phase M0.8A: Reading Sets & Exact Passage Segments Semantic Refinements**

Current status: Explicit separation of reading source context (`ReadingSetContext`: `WEEKDAY`, `SUNDAY`, `PROPER_OF_SAINTS`, `PROPER_OF_SEASON`, `COMMON_OF_SAINTS`) from selection status (`ReadingSetSelectionStatus`: `SOLE_SET`, `ALTERNATIVE`, `OPTIONAL`); removal of unsupported default privilege (`isCanonicalDefault: Boolean?`, `null` for equal August 29 options); removal of `optionGroup` string tags in favor of complete self-contained `ReadingSet` instances; `TextResolutionStatus` enum (`VERIFIED_EXACT`, `REQUIRES_MANUAL_SEGMENT_REVIEW`, `TEXT_UNAVAILABLE`); fail-closed Psalm versification resolver (`scripture-resolver.ts`); exact verified per-set `sourceUrl`; Prisma migration (`20260828203500_reading_sets_semantic_refinement`); updated ingestion contract & validator; updated real package (`universal-roman-2026-08-28-to-2026-09-03.json` v2.1.0); `/today` service query helper exposing `hasMultipleSets` and `hasUncontestedDefault`; and 16/16 passing ingestion unit tests fully implemented. Real canonical database content remains 100% unmutated (5 LiturgicalSeason rows, 0 content rows). Real database apply was NOT executed and remains paused for human architectural review.

---

## 2. Approved Technology Stack

- **Framework:** Next.js 16.3.3 (App Router, Server Components)
- **Language:** TypeScript 5.x (Strict mode enabled)
- **Runtime & Package Manager:** Node.js v24.x, pnpm
- **Database ORM:** Prisma ORM 7.10.0 (PostgreSQL provider)
- **Database Engine:** PostgreSQL (Managed, e.g. Neon)
- **Styling:** Standard CSS with custom properties (CSS variables for design identity tokens)
- **Code Quality:** ESLint (`next/core-web-vitals`), Prettier
- **Hosting Target:** Vercel

---

## 3. Repository Directory Responsibilities

- **`src/app/`**: Next.js App Router routes, layouts, and API endpoints. Domain logic must remain outside page components.
- **`src/components/`**: Reusable UI components adhering to the reverent visual design system.
- **`src/lib/`**: Domain services, typed interfaces, and core business logic isolated from presentation components:
  - `src/lib/liturgy/`: Liturgical day calculations, celebrations, temporal/sanctoral cycles, readings.
  - `src/lib/saints/`: Saints reference library domain logic, feast days, patronages.
  - `src/lib/prayers/`: Catholic prayers repository and Rosary structures.
  - `src/lib/novenas/`: Novena structures and daily prayer pathways.
  - `src/lib/catechism/`: Catechism of the Catholic Church entries and pillar taxonomy.
  - `src/lib/formation/`: Formation pathways, modules, and learning sequences.
  - `src/lib/search/`: Full-text search and filtering abstractions.
  - `src/lib/seo/`: Canonical metadata, Open Graph, and sitemap utilities.
  - `src/lib/validation/`: Input sanitization and schema validation.
  - `src/lib/prisma/`: Lazy Prisma client singleton instance.
- **`prisma/`**: Prisma 7 schema (`schema.prisma`) and root configuration (`prisma.config.ts`).
- **`scripts/wordpress-migration/`**: Idempotent WordPress content import and transformation tooling.
- **`docs/`**: Technical architecture and migration phase documentation.
- **`public/`**: Static assets, fonts, and images.

---

## 5. Homepage Rendering Strategy

The CredoCatholica homepage (`src/app/page.tsx`) uses dynamic server-side rendering (`export const dynamic = 'force-dynamic'`).

### Architectural Rationale
- **Dynamic Liturgical Calendar Data:** The homepage embeds "Today's Liturgy" (Pillar I), which depends on current calendar dates and daily database records (`LiturgicalDay`, `Celebration`, `Reading`).
- **Why Build-Static Rendering is Prohibited:** Prerendering `/` at `next build` time would freeze the date and database snapshot permanently into static HTML, preventing new daily liturgical content from appearing when dates change without deploying a new application build.
- **On-Demand Server Rendering:** With `force-dynamic`, the homepage is evaluated on demand by React Server Components per HTTP request. Future verified `LiturgicalDay` data published in the database immediately becomes visible to users without client-side fetching hooks, complex caching layers, or cron job dependencies.
- **Graceful Error & Empty State Boundary:** The `getTodayLiturgicalSummary()` domain service isolates all database read logic. If zero `LiturgicalDay` rows exist or if a database query fails, a safe discriminated result (`EMPTY` or `ERROR`) is returned, rendering a dignified empty state without exposing raw Prisma exceptions to the browser.

