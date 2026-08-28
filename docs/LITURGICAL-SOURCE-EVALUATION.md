# CredoCatholica — Liturgical Source Evaluation & Legal Matrix

## 1. Overview & Evaluation Goals

Phase M0.8 evaluates candidate sources for CredoCatholica's Daily Liturgical Companion (`/today` & `/readings/`).

The governing principles are:
- **Accuracy > Speed.**
- **Fidelity > Creativity.**
- **Clarity > Engagement.**
- **Licensing is a Blocker:** Public accessibility does NOT equal permission to copy or redistribute copyrighted lectionary translations.

---

## 2. Source Authority & Legal Comparison Matrix

| Candidate Source | Authority Tier | Data Evaluated | Licensing / Copyright Status | Commercial / Redistribution Rights | Technical Access | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Holy See / Vatican (Vatican.va)** | **TIER 1 (Primary)** | General Roman Calendar dates, Celebration titles, Ranks, Vestment Colors | Public domain / Official Church publication of factual calendar metadata. | Factual calendar dates & ranks reusable. Texts subject to Vatican copyright terms. | Web HTML / Public Reference | `APPROVED_SOURCE` *(Factual Metadata & References Only)* |
| **Douay-Rheims Bible (Challoner Revision, 1899 Ed.)** | **TIER 1 (Primary)** | Exact Scripture text body | Public Domain (Published pre-1928, CC0 status). | 100% Free redistribution, publishing, and API serving. | DRBO.org, Project Gutenberg EBook #1581 | `APPROVED_SOURCE` *(Exclusive Scripture Text Source)* |
| **USCCB (United States Conference of Catholic Bishops)** | **TIER 1 (Episcopal)** | US Mass Readings & NABRE Scripture text | NABRE text copyrighted by Confraternity of Christian Doctrine (CCD). | **REJECTED for Text Redistribution.** Reference citations are factual and reusable. | Web HTML | `REFERENCE_ONLY` *(Factual Citations Only; Text Rejected)* |
| **Liturgy Office of England & Wales** | **TIER 1 (Episcopal)** | Calendar metadata & Jerusalem/CTS Bible references | CTS / Jerusalem Bible text copyrighted by Darton, Longman & Todd / Les Éditions du Cerf. | **REJECTED for Text Redistribution.** Reference citations reusable. | Web PDF / Reference | `REFERENCE_ONLY` *(Factual Citations Only; Text Rejected)* |
| **Universalis (Universalis Publishing Ltd)** | **TIER 2 (Institutional)** | Mass readings & Roman Calendar | Copyrighted by Universalis Publishing Ltd & Jerus./Jerusalem Bible licensors. | **REJECTED for Data Extraction.** Redistribution strictly prohibited by TOS. | Web HTML / App | `REJECTED` |
| **MyCatholic.life / Catholic Gallery** | **TIER 3 (Secondary)** | Daily readings aggregators | Aggregated content; mixed licensing; terms unclear. | **REJECTED.** Unclear copyright rights and secondary aggregation. | Web HTML | `REJECTED` |

---

## 3. Legal Verdict Classifications

1. **`APPROVED_SOURCE`**:
   - **Douay-Rheims Bible (Challoner 1899 Revision):** Genuinely public domain worldwide. Approved as CredoCatholica's canonical Scripture text payload source.
   - **Vatican General Roman Calendar Metadata:** Factual calendar dates, celebration titles, ranks, and vestment colors are non-copyrightable facts (*Feist Publications v. Rural Telephone Service*).
2. **`REFERENCE_ONLY`**:
   - **USCCB & Liturgy Office Lectionaries:** Used strictly to verify factual Scripture citation references (e.g. *1 Corinthians 1:17-25*), NEVER for translation body text (NABRE / Jerusalem Bible).
3. **`REJECTED`**:
   - Commercial aggregators, scraped APIs, AI-generated calendars, or secondary blogs with unclear copyright.

---

## 4. Legal Sourcing Summary

```
+---------------------------------------------------------------------------------------------------+
|                                  CREDOCATHOLICA MULTI-SOURCE PROVENANCE                           |
+------------------------------------+--------------------------------------------------------------+
| Liturgical Domain Element          | Approved Legal Source                                        |
+------------------------------------+--------------------------------------------------------------+
| Calendar Dates & Observances       | General Roman Calendar (Vatican / Universal Baseline)        |
| Scripture Citation References      | Factual Roman Lectionary Citations (Public Factual Data)     |
| Scripture Text Body                | Douay-Rheims Bible (1899 Challoner Revision — Public Domain)  |
| Celebration Ranks & Vestment Colors| Universal Roman Calendar Rubrics (Factual Liturgical Law)   |
| Responsorial Psalm Refrain         | Traditional / Factual Reference (ICEL translations omitted)   |
+------------------------------------+--------------------------------------------------------------+
```
