# Content integrity audit and corrections

Date: 22 October 2026. Repository: Voclain1/credocatholica.

The owner confirmed that this is the correct repository. Differences between
its checked-in source and live responses do not establish that it is the wrong
repository. Production content is also read from PostgreSQL. No live database
URL is available in this working environment; production content has not been
modified here.

## Evidence and coverage

All 324 sitemap URLs returned HTTP 200 in the live scan. That scan found the
identified generic biography passage on 61 saint pages and the identified
generic Day 1 prayer opening on all 27 novena detail pages. Query-selected days,
formation lesson URLs, other dates, client-only content and unpublished records
are additional coverage, not verified by the sitemap scan.

`scripts/content-audit/evidence/live-patterns-2026-10-22.json` retains the affected
URLs, capture times and response fingerprints. Repeated wording is evidence of
templating, not proof that every assertion on a matching page is false.

The repository text audit checked 1,231 text fields in seed data and historical
liturgical packages. Its initial result was 21 exact Scripture source matches,
568 mismatches and 642 unverified fields. Historical versions and amendments
can repeat passages; these numbers are **not** counts of unique live errors.
Some mismatches are punctuation or edition differences. Fields without source
evidence remain unverified even when they contain plausible or correct prose.

Scripture is compared with a pinned copy of Project Gutenberg eBook 1581:

- Source: https://www.gutenberg.org/cache/epub/1581/pg1581.txt
- Snapshot SHA-256: `7d10da78d8ec97db53b4e2bd8719cc01e16106b44937a673ba34aa534a04c007`
- Download size: 5,880,580 bytes; original license and header retained.
- Extraction: only verse labels and physical line wrapping are removed.
- No normalization of punctuation, spelling, case or stored text is used to
  certify a match.
- The source repeats verse labels in Psalm 113. Ambiguous labels require
  manual resolution; the extractor does not pick an occurrence or renumber it.
- An exact text match does not verify the calendar, reading selection, Psalm
  versification or ecclesiastical approval.

The snapshot has no claim to be a newly approved liturgical translation or a
different print edition. If another witness of the selected translation is to
be used, identify and fingerprint that witness before assessing differences.

## Confirmed corrections prepared

| Issue | Correction | Primary evidence |
| --- | --- | --- |
| Patris Corde classified as an exhortation | Apostolic Letter; enum and filters added | https://www.vatican.va/content/francesco/en/apost_letters/documents/papa-francesco-lettera-ap_20201208_patris-corde.html |
| Fidei Depositum record misidentified as the whole Catechism | Identify it as the Apostolic Constitution on publication of the Catechism; retain its existing public slug | https://www.vatican.va/content/john-paul-ii/en/apost_constitutions/documents/hf_jp-ii_apc_19921011_fidei-depositum.html |
| Broken Vatican II source links | Correct `vatican_ii` to `ii_vatican_council` on the official host | https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19641121_lumen-gentium_en.html |
| Divinum illud munus dated 1895 in seed metadata | Correct encyclical references to 1897; this does not verify the claimed novena manual | https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_09051897_divinum-illud-munus.html |
| Saint Thomas More linked to Universal Church patronage | Prepared single-saint relation correction to Statesmen and Politicians; no blanket removal on other saints | https://www.vatican.va/content/john-paul-ii/en/motu_proprio/documents/hf_jp-ii_motu-proprio_20001031_thomas-more.html |
| Catechism source URL dropped during ingestion | Add nullable `sourceUrl` and retain the supplied value; a retained URL is not a verified quotation | Schema and importer diff |
| Every saint/prayer page claims review or canonical provenance | Remove blanket assurance and state verification accurately | These pages contain no record-specific verification evidence |
| Document summaries described as official | Label them editorial; remove added quotation marks around unverified reference text | Issuing-authority sources above |
| Internal null diagnostic shown in liturgy notes | Remove the known diagnostic from presentation notes only | Live homepage and liturgical input notes |

These changes do not restore the complete original corpus. New texts have not
been invented, and incomplete records have not been silently certified.

## Preventing recurrence

Legacy M1 seeds contain summaries and excerpts. New seed records now remain
drafts. Both seed appliers perform a read-only preflight and refuse to overwrite
published targets. This is a safeguard, not a new editorial review workflow.

Liturgical dry runs and applies now compare every `VERIFIED_EXACT` claim
(including the legacy implicit default) with the pinned source before the first
database mutation. Missing references, truncated text, changed punctuation,
unsupported partial verses and ambiguous source labels cannot pass as exact.
Existing approved input packages and approval hashes are preserved unchanged.
Text restoration requires a new reviewed package; do not bypass approval by
editing an old package or downgrading a mismatch to a manual status merely to
make an import pass.

## Running the audit

From the repository root:

```bash
pnpm content:audit --repository --output /absolute/new-repository-audit.json
pnpm content:audit --database --output /absolute/new-database-audit.json
pnpm content:audit --database --check
pnpm content:test
```

The repository mode is offline and never connects to PostgreSQL. Database mode
requires an explicit configured `DATABASE_URL`, uses a read-only repeatable-read
transaction and includes drafts. `--check` exits unsuccessfully when any field
is unverified or mismatched. Output files are exclusively created, never
silently overwritten. Source candidates in reports are evidence, not automatic
permission to change verse selection or replace entire records.

## Applying the confirmed metadata repairs

The additive migration introduces `APOSTOLIC_LETTER`,
`APOSTOLIC_CONSTITUTION` and nullable `CatechismEntry.sourceUrl`. It removes no
fields or existing text. Apply it before deploying the regenerated client.

```bash
pnpm exec prisma migrate deploy
pnpm content:repair-metadata
pnpm content:repair-metadata --apply --backup /absolute/new-metadata-backup.json
```

The first repair command is read-only. The second writes the original metadata
and relation values to a new recovery file before any mutation, then applies
only the evidenced metadata changes in one serializable transaction. Timestamp
checks and row-count checks abort stale changes; any failure rolls back the
transaction. The backup includes prior relationship IDs and whether the correct
patronage relation already existed, for precise rollback. The repair does not
change any canonical body text or blanket-update other saints' patronages.

After applying, run the database audit again. Inspect each correction and then
the public page, official link, filter and retained public URL.

## Remaining restoration work

Obtain the read-only live database audit with the existing configured database
connection. For every remaining prayer, all nine days of every novena, saint
biography/fact/patronage, Catechism paragraph range, document, reflection and
formation lesson, identify its exact original edition and locator. Compare the
full text, preserve the pre-change value, and prepare a source-backed diff.

The former WordPress wording is a possible historical witness, not automatic
proof of correctness. Human doctrinal review remains authoritative. Original
editorial material must not be relabelled as original Church text.

The live homepage's Rosary card has a day/mystery mismatch. The checked-in
homepage has no Rosary card and there is no tracked `/rosary` page in this
checkout. Reconcile that specific deployment/source difference before replacing
the homepage; this finding does not contradict the repository identity.

## Validation limits

The exact-source and metadata tests run without a database. Two existing
mutation integration tests now require an explicit disposable
`TEST_DATABASE_URL` equal to `DATABASE_URL`; without it they are skipped. Database
schema/data repair, deployment and full-corpus restoration cannot be reported as
completed until run against the target database with the migration applied.

Validation on this branch: Next.js production build, TypeScript and ESLint passed.
The combined suite reported 48 tests: 46 passed and 2 database mutation tests
skipped. Prisma schema validation passed. Target database migration and repair
have not been run.
