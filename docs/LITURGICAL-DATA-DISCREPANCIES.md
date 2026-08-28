# CredoCatholica — Liturgical Data Discrepancy Register

## 1. Overview & Audit Scope

This document tracks all data discrepancies, versification mismatches, or rubrical ambiguities discovered between candidate liturgical sources during ingestion package preparation.

- **Package Evaluated:** `universal-roman-2026-08-28-to-2026-09-03.json`
- **Date Range Covered:** August 28, 2026 — September 3, 2026 (7 Liturgical Days)
- **Reviewer:** CredoCatholica Engineering Agent & Doctrinal Review Team

---

## 2. Discrepancy Inventory

| Date | Field | Source A (Universal Roman Baseline) | Source B (Douay-Rheims Versification) | Chosen Canonical Value | Rationale & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-08-28** | Responsorial Psalm Citation | `Psalm 33:1-2, 4-5, 10-11` (Modern Lectionary) | `Psalm 32:1-2, 4-5, 10-11` (Douay-Rheims / Vulgate) | `citationRef: "Psalm 33:1-2, 4-5, 10-11"` with D-R Psalm 32 text | Modern Lectionary reference preserved in `citationRef`; text payload resolves deterministically to Douay-Rheims Vulgate Psalm 32. | **RESOLVED** |
| **2026-08-29** | Celebration Title | *"Passion of Saint John the Baptist"* / *"Beheading of Saint John the Baptist"* | *"Deollatio S. Joannis Baptistae"* (Traditional Roman Martyrology) | *"The Beheading of Saint John the Baptist"* | Standard English translation of Universal Roman Calendar Memorial title. | **RESOLVED** |
| **2026-08-30** | Gloria & Creed | `gloriaRequired: true`, `creedRequired: true` | Explicit Universal Calendar Sunday rubrics | `gloriaRequired: true`, `creedRequired: true` | 22nd Sunday in Ordinary Time requires both Gloria and Creed according to Roman Missal rubrics. | **RESOLVED** |
| **2026-09-03** | Celebration Title & Rank | *"Saint Gregory the Great, Pope and Doctor of the Church"* (Memorial) | General Roman Calendar | `title: "St. Gregory the Great, Pope and Doctor of the Church"`, `rank: "MEMORIAL"` | Fixed feast day of St. Gregory the Great (Sept 3) in Universal Roman Calendar. | **RESOLVED** |

---

## 3. Discrepancy Summary Statistics

- **Total Liturgical Days Evaluated:** 7
- **Total Discrepancies Flagged:** 4
- **Resolved Discrepancies:** 4 (100%)
- **Unresolved / Blocking Discrepancies:** 0
