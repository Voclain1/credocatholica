# CredoCatholica — Human Editorial & Doctrinal Approval Runbook

## 1. Purpose & Principles

CredoCatholica enforces strict editorial governance. Canonical Catholic liturgical records (Mass readings, Scripture citations, celebration titles, ranks, colors) CANNOT enter PostgreSQL through automated pipelines alone. Human review is mandatory.

---

## 2. Reviewer Checklist

Before approving a dry-run ingestion package, the human reviewer must verify:

1. **Scripture Fidelity:**
   - Text is verbatim Douay-Rheims (public domain).
   - No modern paraphrasing, verse omissions, or unauthorized punctuation changes.
   - Responsorial Psalm refrain (`response`) matches traditional Roman Gradual / Lectionary refrain.

2. **Liturgical Accuracy:**
   - Calendar date (`YYYY-MM-DD`) and season code match Universal Roman Calendar.
   - Celebration rank (`SOLEMNITY`, `FEAST`, `MEMORIAL`, `OPTIONAL_MEMORIAL`) matches canonical calendar.
   - Vestment color is correctly specified (`GREEN`, `VIOLET`, `WHITE`, `RED`, `ROSE`, `BLACK`).
   - Gloria and Creed flags accurately reflect liturgical rubrics.

3. **Reconciliation Quality:**
   - Zero BLOCKER errors in reconciliation report.
   - All warnings reviewed and acknowledged.

---

## 3. Creating the Approval Artifact

Once the package is reviewed and verified:

1. Run dry-run to obtain the package SHA-256 hash:
   ```bash
   pnpm run liturgy:ingest --package=scripts/liturgical-ingestion/input/my-package.json
   ```
2. Create an approval file under `scripts/liturgical-ingestion/approvals/<package-name>.approval.json`:

```json
{
  "packageHash": "<EXACT_SHA_256_HASH_FROM_DRY_RUN>",
  "packageName": "2026-08-readings",
  "dateRange": {
    "start": "2026-08-28",
    "end": "2026-08-31"
  },
  "status": "APPROVED_FOR_INGESTION",
  "reviewer": "J.M. (Human Doctrinal Reviewer)",
  "approvedAt": "2026-08-28T19:00:00Z",
  "notes": "Verified against Douay-Rheims Bible and Universal Roman Calendar."
}
```

---

## 4. Invalidation & Re-Approval Rules

- **Hash Binding:** The approval manifest is bound to the exact SHA-256 hash of the source package JSON payload.
- **Modification Invalidation:** If any source record, date, reading text, or metadata field is altered after approval, the package hash changes. The apply engine will refuse execution until a new approval artifact with the updated hash is generated.
- **No Overrides:** `--force` flags do not exist. Apply mode requires a valid matching approval manifest.
