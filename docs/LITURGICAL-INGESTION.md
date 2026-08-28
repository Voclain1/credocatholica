# CredoCatholica — Liturgical Data Ingestion Pipeline Architecture

## 1. Overview & Governing Principles

Phase M0.7 establishes a deliberate, reviewable ingestion pipeline for canonical Catholic liturgical data (`LiturgicalDay`, `Celebration`, `Reading`).

Governing Principles:
- **Accuracy > Speed.**
- **Fidelity > Creativity.**
- **Clarity > Engagement.**
- **No Fabrication:** Scripture text, Psalm refrains, celebrations, colors, ranks, and saint linkages are never invented, paraphrased, or inferred from memory.
- **Dry-Run by Default:** Execution defaults to dry-run mode (`pnpm run liturgy:ingest`) with zero database modifications.

---

## 2. Ingestion Pipeline Stages

```
   LOAD
    ↓
   SOURCE CONTRACT VALIDATION (Douay-Rheims, Metadata, Schema)
    ↓
   NORMALIZATION (HTML sanitization without text payload modification)
    ↓
   LITURGICAL STRUCTURAL VALIDATION (Date collisions, Seasons, Colors, Cycles)
    ↓
   SCRIPTURE & READING VALIDATION (ReadingType, Order, Citation, Psalm Refrain)
    ↓
   RELATIONSHIP VALIDATION (Saint resolution)
    ↓
   RECONCILIATION REPORT GENERATION (JSON + Markdown)
    ↓
   HUMAN APPROVAL MANIFEST VERIFICATION (SHA-256 Hash Binding)
    ↓
   OPTIONAL APPLY (Requires --apply, LITURGY_INGEST_ENV=development, matching approval)
```

---

## 3. Source Package Contract

Ingestion packages are structured JSON files placed under `scripts/liturgical-ingestion/input/` or tested via `fixtures/`.

### Package Schema Requirements:
- `metadata.packageName`: Unique string key.
- `metadata.sourceName`: Name of source provider.
- `metadata.sourceType`: `CANONICAL_SCRIPTURE_AND_LITURGY`.
- `metadata.scriptureTranslation`: Must be `Douay-Rheims` (public domain).
- `metadata.licensingBasis`: Documented legal basis (e.g. Public Domain Douay-Rheims Bible).
- `records`: Array of `SourceDayRecord` objects containing:
  - `date`: `YYYY-MM-DD`
  - `calendarCode`: Default `"UNIVERSAL"`
  - `seasonCode`: Mapped against `seasons.json` (`ADVENT`, `CHRISTMAS`, `ORDINARY_TIME`, `LENT`, `EASTER`)
  - `liturgicalColor`: Mapped against `colors.json` (`GREEN`, `VIOLET`, `WHITE`, `RED`, `ROSE`, `BLACK`)
  - `yearCycle`: `YEAR_A` | `YEAR_B` | `YEAR_C`
  - `weekdayCycle`: `YEAR_1` | `YEAR_2`
  - `gloriaRequired`: boolean
  - `creedRequired`: boolean
  - `celebrations`: Array of celebrations with `title`, `rank`, `color`, `precedenceOrder`
  - `readings`: Array of ordered readings with `type`, `readingOrder`, `citationRef`, `response`, `text`

---

## 4. Cryptographic Hashing & Approval Binding

1. **Package SHA-256 Hash:** Computed deterministically over the entire package object using `computePackageHash()`.
2. **Approval Binding:** The human approval manifest (`scripts/liturgical-ingestion/approvals/<packageHash>.approval.json`) binds directly to the package SHA-256 hash.
3. **Invalidation:** If the source package content changes by even 1 character, the computed SHA-256 hash changes, immediately invalidating previous human approvals.

---

## 5. Apply Safety Gates

Apply mode requires ALL four conditions:
1. Explicit CLI argument: `--apply`
2. Environment variable: `LITURGY_INGEST_ENV=development`
3. Zero BLOCKER validation issues (`structurallyValid: true`)
4. Verified matching human approval manifest (`verdict: APPROVED_FOR_APPLY`)

If any safety condition is absent, database apply is aborted before making any writes.

---

## 6. Distinction from Future Liturgical Calendar Engine

This ingestion pipeline is an **ingestion & human review pipeline**, NOT a calendar computation engine.
It does **NOT**:
- Compute Easter dates or Advent boundaries;
- Calculate movable feast dates dynamically;
- Infer celebration precedence tables;
- Infer liturgical vestment colors from ranks or seasons.

All liturgical attributes must be explicitly supplied in the approved source package.
