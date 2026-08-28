# CredoCatholica — Liturgical Presentation Architecture (`/today`)

## 1. Overview & Purpose

The `/today` route serves as CredoCatholica's canonical **Daily Liturgical Companion** (Pillar I). It displays daily Scripture readings, liturgical celebrations, sanctoral observances, and temporal notes for the Universal Roman Calendar.

---

## 2. Rendering Model

- **Server-Rendered on Demand:** `src/app/today/page.tsx` uses Next.js React Server Components with `export const dynamic = 'force-dynamic'`.
- **Zero Client-Side Data Fetching:** Data access is performed entirely on the server via domain service [`src/lib/liturgy/service.ts`](file:///c:/Users/acer/Desktop/CredoCatholica/src/lib/liturgy/service.ts).
- **Presentation Layer Boundary:** The presentation layer consumes existing canonical records stored in PostgreSQL. It does **NOT** attempt to calculate celebrations, infer precedence, compute Easter dates, or generate synthetic content.

---

## 3. Data Sources & Schema Mapping

The presentation service queries canonical models from [`prisma/schema.prisma`](file:///c:/Users/acer/Desktop/CredoCatholica/prisma/schema.prisma):

```
+-----------------------------------------------------------------------------------------------+
|                                 LITURGICAL PRESENTATION MAPPING                              |
+--------------------------+--------------------------------------------------------------------+
| Model                    | Presentation Role                                                  |
+--------------------------+--------------------------------------------------------------------+
| LiturgicalDay            | Date context, season, liturgical color, cycles, notes, requirements|
| Celebration              | Celebration title, intrinsic rank, fixed date, biography summary  |
| LiturgicalDayCelebration | Join metadata: precedenceOrder, isOptional, isCommemoration        |
| Reading                  | Sequence-ordered readings: First Reading, Psalm, Gospel, etc.      |
| LiturgicalSeason         | Season name, default color, and seasonal summary                   |
| Saint                    | Explicitly linked Saint summary (name, ecclesial status)           |
| Reflection               | Associated daily spiritual reflection preview                      |
+--------------------------+--------------------------------------------------------------------+
```

---

## 4. Date Resolution Strategy

- **Date Helper:** Isolated in `resolveApplicationDate(targetDate?: Date)`.
- **Interim Timezone Boundary:** Uses UTC ISO date string (`YYYY-MM-DD`) as an interim technical lookup boundary.
- **Global Contextualization:** Future phases will introduce user/calendar timezone contextualization. The current UTC boundary is a technical lookup key, NOT a canonical liturgical calculation rule.

---

## 5. Celebration Precedence Presentation

1. **Principal Celebration (`precedenceOrder === 1`):** Rendered prominently in [`CelebrationSummary.tsx`](file:///c:/Users/acer/Desktop/CredoCatholica/src/components/liturgy/CelebrationSummary.tsx) with full title, rank badge, liturgical color accent, biography summary, and related saint information.
2. **Secondary & Optional Observances (`precedenceOrder > 1`):** Rendered separately and more quietly as a list of optional memorials or commemorations.

*Schema Limitation & Convention Note:* `LiturgicalDayCelebration` does not contain an explicit `isPrincipal` boolean field. Selection of `precedenceOrder === 1` is a **documented M0.6 presentation convention**, NOT the future canonical liturgical precedence engine. `service.ts` deterministically selects at most one principal celebration per day so ambiguous or malformed relationship data never produces multiple principal blocks. Deferred or unresolved legacy `feast_name` strings are strictly excluded.

---

## 6. Scripture Reading Ordering & Format

Readings are ordered strictly by `Reading.readingOrder` ascending:

1. **First Reading (`FIRST_READING`):** Citation, text, copyright notice.
2. **Responsorial Psalm (`RESPONSORIAL_PSALM`):** Rendered in [`PsalmSection.tsx`](file:///c:/Users/acer/Desktop/CredoCatholica/src/components/liturgy/PsalmSection.tsx). Psalm citation, **R.** Refrain response clearly distinguished, and stanzas text.
3. **Second Reading (`SECOND_READING`):** Citation, text, copyright notice.
4. **Gospel Acclamation (`GOSPEL_ACCLAMATION`):** Citation, refrain response, text.
5. **The Holy Gospel (`GOSPEL`):** Highest visual hierarchy without theatrical styling. Text rendered verbatim without fabricated liturgical rubrics.

*Rule:* Scripture text is preserved verbatim from the public-domain Douay-Rheims translation. If text is missing, an incomplete-data notice is rendered; text is never fabricated.

---

## 7. Liturgical Color Accent Mapping

Liturgical color is rendered as a restrained visual accent (badges, borders, small markers) via [`LiturgicalBadge.tsx`](file:///c:/Users/acer/Desktop/CredoCatholica/src/components/ui/LiturgicalBadge.tsx):

- `GREEN` -> `.badge-liturgical-green`
- `VIOLET` -> `.badge-liturgical-violet`
- `WHITE` -> `.badge-liturgical-white`
- `RED` -> `.badge-liturgical-red`
- `ROSE` -> `.badge-liturgical-rose`
- `BLACK` -> `.badge-liturgical-black`

The full page background is never flooded with solid colors.

---

## 8. Empty & Error State Behavior

- **Empty State (`EMPTY`):** When no `LiturgicalDay` row exists for the lookup date, [`LiturgicalEmptyState.tsx`](file:///c:/Users/acer/Desktop/CredoCatholica/src/components/liturgy/LiturgicalEmptyState.tsx) renders a dignified first-class experience ("Daily Liturgical Content Being Prepared"). Avoids "404", "No data found", or fake readings.
- **Error State (`ERROR`):** Server-side catch block logs errors safely. Client receives a calm error message ("Liturgical Service Temporarily Unavailable") with zero exposure of Prisma models, stack traces, or database hostnames.

---

## 9. Print-Friendly Foundation

Includes `@media print` CSS rules in `src/app/globals.css`:
- Navigation, header, footer, and skip-links hidden in print view.
- High-contrast black text on pure white background.
- Preserves reading hierarchy and stanzas.
