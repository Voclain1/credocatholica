# CredoCatholica — WordPress Migration Operational Runbook

## 1. Executive Summary & Migration Workflow

This runbook outlines the operational steps for executing the WordPress-to-Next.js data migration pipeline. The pipeline processes exported WordPress JSON files, normalizes content, validates business and doctrinal integrity, sanitizes HTML, resolves cross-entity relationships, and outputs detailed reconciliation reports.

```
+-----------------------------------------------------------------------------------------------+
|                                MIGRATION PIPELINE WORKFLOW                                    |
+-------------------+-------------------+-------------------+-------------------+---------------+
| 1. EXPORT         | 2. DRY-RUN        | 3. REVIEW REPORT  | 4. APPLY MODE     | 5. AUDIT      |
| WordPress Export  | Execute CLI in    | Audit reconciliation| Execute CLI with  | Verify DB     |
| per Export Spec   | --dry-run mode    | report in reports/| --apply flag      | state         |
+-------------------+-------------------+-------------------+-------------------+---------------+
```

---

## 2. Prerequisites & Safety Gates

### Environment & Tools
- Node.js 22.x
- pnpm 9.x
- `tsx` package runner
- PostgreSQL Development Database (Neon Dev Branch)

### Safety Gates for Database Writes (`--apply`)
To prevent accidental production data overwrites, `--apply` mode requires **ALL THREE** of the following conditions:
1. CLI flag `--apply` explicitly provided.
2. Environment variable `MIGRATION_ENV=development` explicitly set.
3. Environment variable `MIGRATION_DATABASE_LABEL=credocatholica-development` explicitly set.

If any safeguard is missing, database execution aborts instantly prior to any database write operations.

---

## 3. Package CLI Commands

| Command | Description | DB Required? |
| :--- | :--- | :--- |
| `pnpm migration:wp` | Executes dry-run against `scripts/wordpress-migration/input/` | **NO (100% Offline)** |
| `pnpm migration:wp:fixtures` | Executes dry-run against synthetic `scripts/wordpress-migration/fixtures/` | **NO (100% Offline)** |
| `pnpm migration:wp:apply` | Executes transactional import against Neon dev PostgreSQL | **YES** |
| `pnpm migration:wp:test` | Executes automated migration unit test suite via `tsx --test` | **NO (100% Offline)** |

---

## 4. Execution Procedures

### Step 1: Export Package Generation
1. Follow [docs/WORDPRESS-EXPORT-SPEC.md](file:///c:/Users/acer/Desktop/CredoCatholica/docs/WORDPRESS-EXPORT-SPEC.md) to generate `posts.json`, `postmeta.json`, `terms.json`, `term-taxonomy.json`, `term-relationships.json`, and `media.json`.
2. Place the files into `scripts/wordpress-migration/input/`.

### Step 2: Run Offline Dry-Run Verification
Run the offline dry-run tool:
```bash
pnpm migration:wp
```
Or test against synthetic fixtures:
```bash
pnpm migration:wp:fixtures
```

### Step 3: Audit Reconciliation Report
Inspect the generated Markdown report under `scripts/wordpress-migration/reports/reconciliation-[timestamp].md`.

Review metrics:
- **SOURCE:** Records loaded per CPT and taxonomy.
- **TRANSFORMED:** Planned `WOULD_INSERT`, `WOULD_UPDATE`, `WOULD_SKIP` counts.
- **QUALITY:** Count of `VALID`, `WARNING`, `FAILED`, `DEFERRED`, `UNRESOLVED_RELATIONSHIPS`, `UNKNOWN_ENUMS`, `DUPLICATE_SLUGS`, and `SANITIZED_FIELDS`.

### Step 4: Execute Database Apply (Development Only)
Once reconciliation review is clean:
```bash
MIGRATION_ENV=development MIGRATION_DATABASE_LABEL=credocatholica-development pnpm migration:wp:apply
```

---

## 5. Idempotency & Rerun Strategy

The pipeline is fully idempotent based on the `MigrationRecord` identity constraint:
`UNIQUE(sourceSystem, legacyObjectType, legacyObjectId)`

On rerunning the migration:
- **Existing Entity + Matching `MigrationRecord`:** Safely updates mapped canonical fields (`UPDATED`).
- **Unchanged Source Record:** Skipped (`UNCHANGED`).
- **New Legacy Source Object:** Inserted (`INSERTED`).
- **Deleted WordPress Object:** Canonical entity is **NOT** automatically deleted (protects canonical database integrity).

---

## 6. Rollback & Disaster Recovery Strategy

1. **Transactional Safety:** Domain imports run within database transactions. If a transaction batch fails, changes within that batch roll back automatically without partial corruption.
2. **Migration Rollback:** If an entire development migration must be undone, reset the development database state via Prisma migrations:
   ```bash
   pnpm exec prisma migrate reset --force
   ```
   *(Allowed ONLY in local/development environment).*
