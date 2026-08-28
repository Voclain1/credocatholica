# CredoCatholica — Technical Architecture Specification

## 1. Current Migration Phase

**Phase M0.7: Liturgical Ingestion & Approval Pipeline**

Current status: Human-reviewed liturgical data ingestion & approval pipeline (`scripts/liturgical-ingestion/`), SHA-256 package hash verification, human approval manifest binding (`scripts/liturgical-ingestion/approvals/`), Douay-Rheims Scripture text integrity checks, strict multi-stage validation (`validator.ts`), JSON & Markdown reconciliation reports (`reconciliation.ts`), dry-run default CLI runner (`run.ts`), apply safety gates (`applier.ts`), synthetic structural fixtures (`fixtures/`), unit test suite (`liturgy:ingest:test`), and runbook documentation (`docs/LITURGICAL-INGESTION.md`, `docs/LITURGICAL-APPROVAL.md`) fully implemented and verified. Real canonical database content remains uncorrupted with 5 reference seasons and 0 fake content rows.

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

