# CredoCatholica

CredoCatholica is a global Catholic digital platform comprising:

1. **Daily Liturgical Companion**
2. **Permanent Catholic Reference Library**
3. **Structured Formation Pathways**

This repository is the Next.js successor application to the legacy WordPress platform.

---

## Migration Status

- **Current Phase:** M0.1 (Engineering Baseline & Repository Initialization)
- **Status:** Active baseline ready. Next.js 16.3.3 App Router, TypeScript strict mode, Prisma 7 configuration, and domain directory architecture established.

---

## Environment Requirements

- **Node.js:** `>= 20.x` (Tested on v24.15.0)
- **Package Manager:** `pnpm` (`^9.x`)
- **Database:** PostgreSQL (Managed, e.g., Neon or local PostgreSQL instance)

---

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CredoCatholica
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Update `DATABASE_URL` with your local or staging PostgreSQL credentials.

---

## Development Commands

- `pnpm dev`: Start local Next.js development server
- `pnpm build`: Run TypeScript type checking and production build
- `pnpm start`: Start production server build output
- `pnpm lint`: Run ESLint check (`next/core-web-vitals`)
- `pnpm typecheck`: Run explicit TypeScript typecheck (`tsc --noEmit`)

---

## Documentation

- [Technical Architecture](docs/ARCHITECTURE.md)
- [Engineering Instructions](AGENTS.md)
