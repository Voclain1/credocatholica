# CredoCatholica — Technical Architecture Specification

## 1. Current Migration Phase

**Phase M0.3: Canonical Prisma Schema Implementation**

Current status: Canonical Prisma schema (`prisma/schema.prisma`) implemented, formatted, validated, and generated into `src/generated/prisma`. 22 canonical domain models and explicit join entities established. Schema validated with zero TypeScript or ESLint baseline errors. Migration creation pending provisioned development PostgreSQL database credentials.

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

## 4. Dependency Boundaries

1. **Domain Isolation:** React components in `src/app/` or `src/components/` must consume services in `src/lib/` and must never call Prisma directly inside UI render functions.
2. **Liturgical Calculations:** Liturgical logic must be deterministic and testable, residing strictly within `src/lib/liturgy/`.
3. **Data Access:** All database interaction must flow through typed Prisma services in `src/lib/`.
4. **Third-Party Packages:** Minimize external dependencies; rely on standard Next.js, React, Node.js, and Prisma capabilities.
