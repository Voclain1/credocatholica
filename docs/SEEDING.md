# CredoCatholica — Canonical Reference Data Seeding

## 1. Overview

CredoCatholica uses an explicit, repeatable Prisma seed script ([`prisma/seed.ts`](file:///c:/Users/acer/Desktop/CredoCatholica/prisma/seed.ts)) to populate canonical reference data (such as universal Roman `LiturgicalSeason` entries) into the database.

---

## 2. Environment Safety Controls

To prevent accidental seed execution against production environments:

- **Mandatory Safety Variable:** The seed script requires `SEED_ENV=development`.
- **Human Safety Gate:** If `SEED_ENV` is not set to `development`, `prisma/seed.ts` immediately aborts with an error and terminates execution before making any database mutation.
- **Credential Protection:** Seed scripts never print database credentials, passwords, or connection strings to stdout/stderr.

---

## 3. Seed Execution Command

To execute database seeding against the development database:

```bash
$env:SEED_ENV="development"; pnpm db:seed
```

Or on Linux/macOS:

```bash
SEED_ENV=development pnpm db:seed
```

*Note: In Prisma 7, seed configuration is managed via [`prisma.config.ts`](file:///c:/Users/acer/Desktop/CredoCatholica/prisma.config.ts) under `migrations.seed = "tsx prisma/seed.ts"`.*

---

## 4. Idempotency & Safety Guarantees

- **Upsert Logic:** All database insertions use Prisma `upsert` keyed on unique natural codes (e.g. `code: "ADVENT"`).
- **Repeatable Execution:** Running `pnpm db:seed` multiple times produces 0 duplicate key errors and leaves data in a clean, consistent state.
- **Non-Destructive:** The seed script never deletes existing rows or mutates non-reference data.
- **Zero Content Fabrication:** No fake Saints, synthetic prayers, or unverified readings are seeded.

---

## 5. Seeded Canonical Reference Data

The seed script populates 5 canonical universal Roman `LiturgicalSeason` records:

| Code | Season Name | Default Liturgical Color | Summary |
| :--- | :--- | :--- | :--- |
| `ADVENT` | Advent | `VIOLET` | Season of preparation and expectant hope for the Nativity of the Lord. |
| `CHRISTMAS` | Christmas | `WHITE` | Season celebrating the Incarnation and Nativity of Jesus Christ. |
| `ORDINARY_TIME` | Ordinary Time | `GREEN` | Season focusing on the public ministry and teachings of Jesus Christ. |
| `LENT` | Lent | `VIOLET` | Season of 40 days of penance, fasting, and prayer. |
| `EASTER` | Easter | `WHITE` | Season of 50 days celebrating the Resurrection of the Lord. |
