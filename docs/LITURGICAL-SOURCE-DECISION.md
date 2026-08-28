# Architectural Decision Record (ADR) — Liturgical Data Sourcing & Provenance Architecture

- **Status:** APPROVED FOR M0.8
- **Date:** 2026-08-28
- **Deciders:** CredoCatholica Engineering Agent & Doctrinal Review Team

---

## 1. Context & Problem Statement

CredoCatholica requires verified, canonical Catholic liturgical data for the Daily Liturgical Companion (`/today` & `/readings/`).
Modern episcopal lectionaries (such as the USCCB NABRE or UK Jerusalem Bible lectionary texts) are protected by copyright law and CANNOT be serving/redistributed in an open digital application without commercial licensing agreements.

---

## 2. Decision Summary

We adopt a **Multi-Source Provenance Architecture**:

1. **Scripture Translation Text:** Exclusively the **Douay-Rheims Bible (1899 Challoner Revision)**, which is in the public domain globally.
2. **Liturgical Calendar Observances & Metadata:** Factual data from the **Universal Roman Calendar** (Vatican baseline), covering calendar dates, celebration titles, intrinsic ranks, and vestment colors.
3. **Mass Reading Selections & Citation References:** Factual biblical chapter/verse range references (e.g. *1 Corinthians 1:17-25*), which are non-copyrightable facts.
4. **Responsorial Psalm Refrains & Gospel Acclamations:** Modern ICEL translations are copyrighted and strictly excluded. Refrains are omitted or populated only when explicit public-domain traditional refrains exist.

---

## 3. Detailed Source Breakdown & Legal Basis

### 3.1 Canonical Scripture Text Source
- **Selected Source:** Douay-Rheims Bible (Challoner Revision, 1899 Murphy Edition / DRBO.org / Project Gutenberg EBook #1581).
- **Legal Basis:** Published prior to 1928; public domain worldwide (CC0).
- **Text Integrity Rule:** Text payloads must be preserved 100% verbatim. No paraphrasing, modernization of archaic English ("thee", "thou", "hath"), or silent punctuation alteration.

### 3.2 Douay-Rheims Versification & Psalm Mapping Strategy
- **Psalm Numbering Mismatch:** The Douay-Rheims Bible follows the Vulgate Psalm numbering system, which is 1 digit behind modern Bibles for Psalms 10 through 147 (e.g., Vulgate Psalm 22 = Modern Psalm 23; Vulgate Psalm 32 = Modern Psalm 33).
- **Resolution Strategy:**
  - `citationRef` stores the canonical Lectionary reference string (e.g., `"Psalm 32:1-2, 4-5, 10-11"`).
  - Scripture text resolution maps modern Psalm 33 to Douay-Rheims Psalm 32 text.
  - This mapping is deterministic and explicitly documented in [`docs/LITURGICAL-SOURCE-DECISION.md`](file:///c:/Users/acer/Desktop/CredoCatholica/docs/LITURGICAL-SOURCE-DECISION.md).
  - If a reference cannot be mapped deterministically, the record is flagged `REQUIRES_REVIEW`.

### 3.3 Calendar Identity & Scope
- **Canonical Calendar Code:** **`"UNIVERSAL"`** (Universal Roman Calendar).
- **Scope Restriction:** Regional, national, or diocesan proper calendars (e.g., USCCB national proper, England & Wales proper) are strictly excluded from the `UNIVERSAL` dataset.

---

## 4. Consequences & Limitations

- **Positive:** 100% legally compliant, zero copyright infringement risk, 100% public domain Scripture text, fully auditable provenance.
- **Limitation:** Users accustomed to modern English translations (NABRE, NRSV-CE) will read traditional Douay-Rheims English text. This is an intentional product design decision established in `AGENTS.md`.
- **Limitation:** ICEL responsorial psalm refrains are omitted when copyrighted. The responsorial psalm displays the citation reference and the Douay-Rheims psalm text without copyrighted contemporary refrains.
