# CredoCatholica — Canonical Data Model Architecture

## 1. Executive Summary & Architectural Principles

CredoCatholica is a structured Catholic digital platform comprising three primary pillars:
1. **Daily Liturgical Companion**
2. **Permanent Catholic Reference Library**
3. **Structured Formation Pathways**

This document establishes the conceptual, relational, and structural architecture for the canonical PostgreSQL / Prisma database domain model. It transitions CredoCatholica from generic WordPress Custom Post Types (CPTs) and unstructured key-value metadata (ACF) into an explicit, type-safe, relational domain model.

### Core Architectural Principles

- **Explicit Domain Modeling over Generic CMS Post Tables:** Every major religious, liturgical, reference, and formation entity has an explicit relational model and defined contract rather than generic post tables.
- **Catholic Content Integrity & Provenance:** Canonical texts (Douay-Rheims Scripture, official prayers, Catechism paragraphs, magisterial documents) are protected, versioned, and linked to authoritative source metadata.
- **Liturgical Distinction:** A *Saint* (person) is architecturally distinct from a *Celebration* (liturgical observance). A *Reading* (Scripture text) is distinct from a *LiturgicalDay* (calendar/temporal context).
- **Referential Integrity over Unconstrained Polymorphism:** Strong foreign keys and explicit join tables are preferred over unconstrained polymorphic IDs to ensure referential safety and reliable database queries.
- **Progressive Enrichment:** Sourcing, editorial governance, and regional calendar capabilities are built into the schema topology without blocking initial migration or requiring destructive schema overhauls.

---

## 2. Canonical Domain Models Overview

The core domain entities are grouped into three primary functional domains, plus classification, governance, and infrastructure domains.

```
+---------------------------------------------------------------------------------------------------+
|                                      CANONICAL DOMAIN LANDSCAPE                                   |
+------------------------------------+----------------------------------+---------------------------+
| LITURGICAL CORE                    | REFERENCE LIBRARY                | FORMATION PATHWAYS        |
| - LiturgicalDay                    | - Saint                          | - FormationPathway        |
| - Celebration                      | - Prayer                         | - FormationModule         |
| - Reading                          | - Novena & NovenaDay             | - FormationLesson         |
| - LiturgicalSeason                 | - CatechismEntry                 |                           |
|                                    | - ChurchDocument                 |                           |
|                                    | - Reflection                     |                           |
+------------------------------------+----------------------------------+---------------------------+
| CLASSIFICATIONS                    | GOVERNANCE & PROVENANCE          | SYSTEM & INFRASTRUCTURE   |
| - Patronage (Model)                | - ContentReview (Model)          | - MigrationRecord (Model) |
| - Vocation (Model)                 | - Source (Model)                 | - SlugRedirect (Model)    |
| - PrayerType (Enum)                | - Citation (Join Model)          | - MediaAsset (Model)      |
| - CelebrationRank (Enum)           |                                  | - SeoMetadata (Model)     |
| - CatechismPillar (Enum)           |                                  |                           |
| - EcclesialStatus (Enum)           |                                  |                           |
+------------------------------------+----------------------------------+---------------------------+
```

---

## 3. Liturgical Core Architecture

The Liturgical domain distinguishes between the temporal day context (`LiturgicalDay`), liturgical observances (`Celebration`), Scripture selections (`Reading`), and temporal cycles (`LiturgicalSeason`).

### 3.1 LiturgicalDay

Represents a specific calendar date within a specific liturgical calendar context (Universal Roman Calendar vs. Regional/National Calendar).

- **`id`**: String (CUID / UUID)
- **`date`**: Date (Calendar day, unique per calendar context)
- **`calendarCode`**: String (e.g., `"US"`, `"UNIVERSAL"`, `"EN-GB"`)
- **`seasonId`**: Foreign Key -> `LiturgicalSeason`
- **`seasonWeek`**: Integer (e.g., 3 for 3rd Sunday/Week of Advent)
- **`yearCycle`**: Enum (`YEAR_A`, `YEAR_B`, `YEAR_C`) — Sunday reading cycle
- **`weekdayCycle`**: Enum (`YEAR_1`, `YEAR_2`) — Weekday reading cycle
- **`liturgicalColor`**: Enum `LiturgicalColor` (`GREEN`, `VIOLET`, `WHITE`, `RED`, `ROSE`, `BLACK`)
- **`gloriaRequired`**: Boolean
- **`creedRequired`**: Boolean
- **`notes`**: Text (Optional liturgical commentary or temporal notes)

### 3.2 Celebration

Represents a liturgical celebration, feast, solemnity, or memorial assigned to a day or fixed feast date.

- **`id`**: String (CUID / UUID)
- **`title`**: String (e.g., *"Solemnity of the Immaculate Conception"*, *"St. Francis of Assisi"*)
- **`slug`**: String (Unique per content type)
- **`rank`**: Enum `CelebrationRank` (`SOLEMNITY`, `FEAST`, `MEMORIAL`, `OPTIONAL_MEMORIAL`)
- **`color`**: Enum `LiturgicalColor` (`GREEN`, `VIOLET`, `WHITE`, `RED`, `ROSE`, `BLACK`)
- **`isMovable`**: Boolean (True if computed relative to Easter or Advent, e.g., Pentecost; False if fixed calendar date)
- **`fixedMonth`**: Integer (1-12, optional)
- **`fixedDay`**: Integer (1-31, optional)
- **`saintId`**: Foreign Key -> `Saint` (Optional link to Saint when celebration is a sanctoral observance)
- **`biographySummary`**: Text (Optional summary override for the feast day context)

*Note on CelebrationRank:* `CelebrationRank` models intrinsic liturgical rank (`SOLEMNITY`, `FEAST`, `MEMORIAL`, `OPTIONAL_MEMORIAL`). Ferial/weekday status is a property of `LiturgicalDay`, not an intrinsic celebration rank. Commemoration status is modeled contextually on `LiturgicalDayCelebration`.

#### LiturgicalDay <-> Celebration Relationship (1:M / Contextual)

A single `LiturgicalDay` can have multiple associated `Celebration` entries to accommodate principal celebrations, optional memorials, and commemorations:
- **`LiturgicalDayCelebration` (Join Model with Metadata):**
  - `liturgicalDayId`: Foreign Key -> `LiturgicalDay`
  - `celebrationId`: Foreign Key -> `Celebration`
  - `precedenceOrder`: Integer (1 = Principal celebration of the day, 2 = Optional memorial alternative, 3 = Commemoration)
  - `isOptional`: Boolean
  - `isCommemoration`: Boolean (True when a celebration is observed as a commemoration on a day of higher precedence)
  - `isTransferred`: Boolean (True if transferred from its canonical date due to Sunday/Solemnity precedence)

### 3.3 Reading

Represents an individual Scripture reading or Psalm text assigned to a `LiturgicalDay` or `Celebration`.

- **`id`**: String (CUID / UUID)
- **`liturgicalDayId`**: Foreign Key -> `LiturgicalDay` (Optional)
- **`celebrationId`**: Foreign Key -> `Celebration` (Optional)
- **`type`**: Enum `ReadingType` (`FIRST_READING`, `RESPONSORIAL_PSALM`, `SECOND_READING`, `GOSPEL_ACCLAMATION`, `GOSPEL`, `OTHER`)
- **`readingOrder`**: Integer (Sequence index: 1, 2, 3, 4)
- **`citationRef`**: String (e.g., *"Isaiah 7:10-14"*, *"Psalm 24:1-2, 3-4ab, 5-6"*, *"Luke 1:26-38"*)
- **`response`**: String (Optional responsorial psalm refrain or gospel acclamation refrain)
- **`text`**: Text (Douay-Rheims canonical Scripture text)
- **`copyrightInfo`**: String (Default: `"Public Domain — Douay-Rheims Translation"`)

*Note on ReadingType:* `ReadingType` strictly identifies structural reading roles. Formulary contexts (e.g., Vigil, Mass During the Day) belong to celebration/formulary metadata, and special Passion texts use structural `GOSPEL` role to prevent role model distortion.

---

## 4. Catholic Reference Library Architecture

### 4.1 Saint Domain

Represents a historical person recognized as a Saint, Blessed, Venerable, or Servant of God by the Catholic Church.

- **`id`**: String (CUID / UUID)
- **`name`**: String (Canonical name, e.g., *"Saint Thomas Aquinas"*)
- **`fullName`**: String (Optional baptismal/birth/religious name)
- **`slug`**: String (Unique per content type, e.g., `"st-thomas-aquinas"`)
- **`titleTeaser`**: String (e.g., *"Doctor of the Church & Angelic Doctor"*)
- **`biography`**: Text (Full canonical biography text)
- **`birthYear`**: String (Optional, e.g., `"1225"`)
- **`deathYear`**: String (Optional, e.g., `"1274"`)
- **`century`**: Integer (Optional, scalar century fallback, e.g., `13` for 13th Century when exact birth/death years are approximate)
- **`feastDateMonth`**: Integer (1-12, fixed devotional feast month)
- **`feastDateDay`**: Integer (1-31, fixed devotional feast day)
- **`ecclesialStatus`**: Enum `EcclesialStatus` (`SERVANT_OF_GOD`, `VENERABLE`, `BLESSED`, `SAINT`) — Represents the formal stage of canonization/recognition within the Catholic Church.
- **`canonizationYear`**: String (Optional, e.g., `"1323"`)
- **`canonizedBy`**: String (Optional, e.g., `"Pope John XXII"`)
- **`isDoctorOfTheChurch`**: Boolean (Default: `false`)
- **`isMartyr`**: Boolean (Default: `false`)
- **`religiousOrder`**: String (Optional, e.g., `"Order of Preachers (Dominicans)"`)
- **`historicalConfidence`**: Enum `HistoricalConfidence` (`HISTORICALLY_DOCUMENTED`, `STRONG_TRADITIONAL_SOURCES`, `PIOUS_TRADITION`)
- **`regionSpecificStatus`**: String (Optional, e.g., `"Patron of Catholic Schools (Universal)"`)
- **`primaryImageId`**: Foreign Key -> `MediaAsset` (Optional)
- **`relicImageId`**: Foreign Key -> `MediaAsset` (Optional)
- **`createdAt`**: Timestamp
- **`updatedAt`**: Timestamp

#### Saint Feast Date Architectural Decision
*Decision (Approved):* **Option C (Canonical `Celebration` relationship plus fixed devotional metadata on `Saint`).**
- Primary liturgical observances live in `Celebration` (allowing rank, movable dates, and regional calendar assignments).
- Fixed `feastDateMonth` and `feastDateDay` fields are retained directly on `Saint` as convenience/devotional browsing metadata (e.g., *"Find saints with feast days in March"*).
- **CRITICAL RULE:** `Saint.feastDateMonth` and `Saint.feastDateDay` MUST NOT be treated as authoritative liturgical calendar computation data.

### 4.2 Prayer Domain

Represents official, traditional, and devotional Catholic prayers.

- **`id`**: String (CUID / UUID)
- **`title`**: String (e.g., *"Anima Christi"*, *"Hail Holy Queen"*)
- **`latinTitle`**: String (Optional, e.g., *"Anima Christi"*)
- **`slug`**: String (Unique per content type, e.g., `"anima-christi"`)
- **`bodyText`**: Text (Canonical English prayer text)
- **`latinText`**: Text (Optional canonical Latin text)
- **`prayerType`**: Enum `PrayerType` (`BASIC`, `MARIAN`, `NOVENA_PRAYER`, `LITANY`, `CREED`, `LITURGICAL`, `CHAPLET`, `DEVOTIONAL`)
- **`isOfficialFormula`**: Boolean (True for canonical prayers like the Rosary or Our Father)
- **`isIndulgenced`**: Boolean (True if historically or currently associated with an indulgence)
- **`seasonalUse`**: String (Optional, e.g., *"Lent"*, *"Easter Season"*)
- **`sourceDocumentId`**: Foreign Key -> `ChurchDocument` (Optional)
- **`createdAt`**: Timestamp
- **`updatedAt`**: Timestamp

### 4.3 Novena & NovenaDay Domain

Represents a 9-day (or structured multi-day) devotional prayer sequence.

#### Novena
- **`id`**: String (CUID / UUID)
- **`title`**: String (e.g., *"Novena to Saint Joseph"*)
- **`slug`**: String (Unique per content type, e.g., `"novena-to-saint-joseph"`)
- **`summary`**: Text (Brief overview and intent of the novena)
- **`openingPrayer`**: Text (Optional standard opening prayer)
- **`closingPrayer`**: Text (Optional standard closing prayer)
- **`historicalOrigin`**: Text (Optional historical context)
- **`isIndulgenced`**: Boolean (Default: `false`)
- **`saintId`**: Foreign Key -> `Saint` (Optional link to associated Saint)
- **`createdAt`**: Timestamp
- **`updatedAt`**: Timestamp

#### NovenaDay (Relational 1:M with Novena)
- **`id`**: String (CUID / UUID)
- **`novenaId`**: Foreign Key -> `Novena`
- **`dayNumber`**: Integer (1 through 9, or explicit index for custom devotional series)
- **`title`**: String (e.g., *"Day 1: Saint Joseph, Model of Workers"*)
- **`intention`**: Text (Daily intention/theme)
- **`prayerText`**: Text (Daily specific prayer text)
- **`reflectionText`**: Text (Optional daily meditation/reflection)
- *Constraint:* `UNIQUE(novenaId, dayNumber)`

### 4.4 CatechismEntry Domain

Represents entries mapped to the Catechism of the Catholic Church (CCC).

- **`id`**: String (CUID / UUID)
- **`title`**: String (e.g., *"The Profession of Faith: The Resurrection of the Body"*)
- **`slug`**: String (Unique per content type, e.g., `"resurrection-of-the-body"`)
- **`paragraphStart`**: Integer (Exact starting CCC paragraph, e.g., `988`)
- **`paragraphEnd`**: Integer (Exact ending CCC paragraph, e.g., `1019`)
- **`pillar`**: Enum `CatechismPillar` (`PART_1_PROFESSION_OF_FAITH`, `PART_2_SACRAMENTS`, `PART_3_LIFE_IN_CHRIST`, `PART_4_CHRISTIAN_PRAYER`)
- **`doctrinalLevel`**: String (Optional, e.g., *"Dogma"*, *"Doctrine"*)
- **`magisterialWeight`**: String (Optional)
- **`councilSource`**: String (Optional, e.g., *"Council of Trent"*, *"Vatican II (Lumen Gentium)"*)
- **`bodyText`**: Text (Explanation and commentary text)
- *Constraint:* `CHECK (paragraphEnd >= paragraphStart)`

### 4.5 ChurchDocument Domain

Represents official magisterial documents, encyclicals, council decrees, and papal writings.

- **`id`**: String (CUID / UUID)
- **`title`**: String (e.g., *"Lumen Gentium"*, *"Rerum Novarum"*)
- **`latinTitle`**: String (Optional, e.g., *"Lumen Gentium"*)
- **`slug`**: String (Unique per content type, e.g., `"lumen-gentium"`)
- **`documentType`**: Enum `DocumentType` (`ENCYCLICAL`, `APOSTOLIC_EXHORTATION`, `BULL`, `MOTU_PROPRIO`, `COUNCIL_CONSTITUTION`, `COUNCIL_DECREE`, `DECLARATION`, `CATECHISM`)
- **`promulgationDate`**: Date (Optional publication date)
- **`issuingAuthority`**: String (e.g., *"Second Vatican Council"*, *"Pope Leo XIII"*)
- **`officialUrl`**: String (Optional link to Vatican website text)
- **`summary`**: Text
- **`bodyText`**: Text (Full text or key excerpts)

### 4.6 Reflection Domain

Represents spiritual, theological, or homiletic reflections.

- **`id`**: String (CUID / UUID)
- **`title`**: String
- **`slug`**: String (Unique per content type)
- **`author`**: String (e.g., *"Church Fathers"*, *"Editorial Team"*)
- **`bodyText`**: Text
- **`liturgicalDayId`**: Foreign Key -> `LiturgicalDay` (Optional)
- **`celebrationId`**: Foreign Key -> `Celebration` (Optional)
- **`readingId`**: Foreign Key -> `Reading` (Optional)
- **`saintId`**: Foreign Key -> `Saint` (Optional)

---

## 5. Structured Formation Pathways Architecture

Represents ordered, module-based Catholic formation courses and learning pathways.

```
+------------------+         +-----------------+         +-----------------+
| FormationPathway | 1 --- * | FormationModule | 1 --- * | FormationLesson |
+------------------+         +-----------------+         +-----------------+
```

### 5.1 FormationPathway
- **`id`**: String (CUID / UUID)
- **`title`**: String (e.g., *"Introduction to the Sacraments"*)
- **`slug`**: String (Unique per content type, e.g., `"intro-to-sacraments"`)
- **`summary`**: Text
- **`description`**: Text
- **`estimatedHours`**: Integer (Optional)
- **`publicationStatus`**: Enum `PublicationStatus`

### 5.2 FormationModule
- **`id`**: String (CUID / UUID)
- **`pathwayId`**: Foreign Key -> `FormationPathway`
- **`moduleOrder`**: Integer (Sequence index: 1, 2, 3...)
- **`title`**: String (e.g., *"Module 1: The Sacraments of Initiation"*)
- **`slug`**: String (Unique per content type)
- **`summary`**: Text
- *Constraint:* `UNIQUE(pathwayId, moduleOrder)`

### 5.3 FormationLesson
- **`id`**: String (CUID / UUID)
- **`moduleId`**: Foreign Key -> `FormationModule`
- **`lessonOrder`**: Integer (Sequence index: 1, 2, 3...)
- **`title`**: String (e.g., *"Lesson 1: The Theology of Baptism"*)
- **`slug`**: String (Unique per content type)
- **`summary`**: Text
- **`bodyText`**: Text
- **`catechismEntryId`**: Foreign Key -> `CatechismEntry` (Optional cross-reference)
- **`churchDocumentId`**: Foreign Key -> `ChurchDocument` (Optional cross-reference)
- *Constraint:* `UNIQUE(moduleId, lessonOrder)`

---

## 6. Classification & Taxonomy Evaluation

Legacy WordPress custom taxonomies have been systematically evaluated to determine whether they warrant first-class relational models, controlled enums, scalar fields, or derived values.

| Legacy Taxonomy | Proposed Canonical Form | Type | Architectural Justification |
| :--- | :--- | :--- | :--- |
| **`cc_patronage`** | `Patronage` | **Relational Model** | Patronages are complex entities (e.g., *"Teachers"*, *"Mothers"*, *"Lost Items"*) with many-to-many relationships across Saints and dedicated index/browse pages. |
| **`cc_vocation`** | `Vocation` | **Relational Model** | Vocations (e.g., *"Bishop"*, *"Mystic"*, *"Monk"*, *"Pope"*) have many-to-many relationships to Saints and dedicated filter/archive views. |
| **`cc_liturgical_season`**| `LiturgicalSeason` | **Relational Model** | Seasons (Advent, Christmas, Lent, Easter, Ordinary Time) contain metadata (color, temporal rules, week counts) best modeled as a reference lookup table linked to `LiturgicalDay`. |
| **`cc_feast_rank`** | `CelebrationRank` | **Controlled Enum** | Intrinsic ranks (`SOLEMNITY`, `FEAST`, `MEMORIAL`, `OPTIONAL_MEMORIAL`) are fixed by Catholic liturgical law. Ferial status belongs to `LiturgicalDay` and commemorations belong to `LiturgicalDayCelebration`. |
| **`cc_prayer_type`** | `PrayerType` | **Controlled Enum** | Prayer types (`BASIC`, `MARIAN`, `LITANY`, `NOVENA_PRAYER`, `CREED`, `LITURGICAL`, `CHAPLET`) are a stable, closed classification set. |
| **`cc_ccc_pillar`** | `CatechismPillar` | **Controlled Enum** | The 4 Pillars of the Catechism are dogmatically fixed by the Catholic Church (`PART_1` through `PART_4`). |
| **`cc_pathway`** | `FormationPathway` | **First-Class Domain Model** | Promoted from taxonomy to top-level domain model (`FormationPathway` -> `FormationModule` -> `FormationLesson`). |
| **`cc_century`** | `Saint.century` / Derived | **Scalar / Derived** | Derived automatically from `birthYear`/`deathYear`. Stored as integer scalar fallback (`century`: e.g. `13` for 13th Century) when exact dates are approximate. |

---

## 7. Editorial Governance & Source Provenance Architecture

### 7.1 Editorial Governance (`ContentReview`)

CredoCatholica requires strict doctrinal accuracy and review tracking. Governance uses explicit foreign-key relationships rather than unconstrained polymorphism.

- **`id`**: String (CUID / UUID)
- **`reviewType`**: Enum `ReviewType` (`SOURCE_VERIFICATION`, `DOCTRINAL_REVIEW`, `EDITORIAL_REVIEW`)
- **`status`**: Enum `ReviewStatus` (`PENDING`, `APPROVED`, `REJECTED`, `REVISION_REQUESTED`)
- **`reviewerName`**: String (Interim reviewer identifier until Auth is added in future phases)
- **`reviewerNotes`**: Text (Optional review commentary or doctrinal notes)
- **`reviewedAt`**: Timestamp
- **`saintId`**: Foreign Key -> `Saint` (Optional)
- **`prayerId`**: Foreign Key -> `Prayer` (Optional)
- **`novenaId`**: Foreign Key -> `Novena` (Optional)
- **`catechismEntryId`**: Foreign Key -> `CatechismEntry` (Optional)
- **`churchDocumentId`**: Foreign Key -> `ChurchDocument` (Optional)

### 7.2 Source Provenance (`Source` & `Citation`)

To eliminate duplicate provenance concepts, a clean **Source + Citation** model is established:

#### Source (Authoritative Source Catalog)
- **`id`**: String (CUID / UUID)
- **`title`**: String (e.g., *"Acta Sanctorum"*, *"Butler's Lives of the Saints"*, *"Catechism of the Catholic Church (Vatican Ed.)"*)
- **`author`**: String (Optional)
- **`publisher`**: String (Optional)
- **`publicationYear`**: String (Optional)
- **`sourceType`**: Enum `SourceType` (`CANONICAL_SCRIPTURE`, `MAGISTERIAL_DOCUMENT`, `PATRISTIC_TEXT`, `HISTORICAL_RECORD`, `TRADITIONAL_BIOGRAPHY`, `CATECHISM`)
- **`url`**: String (Optional authoritative URL)

#### Citation (Explicit Join Model)
- **`id`**: String (CUID / UUID)
- **`sourceId`**: Foreign Key -> `Source`
- **`citationRef`**: String (e.g., *"Vol. IV, p. 112"*, *"Paragraph 1428"*)
- **`excerpt`**: Text (Optional quoted snippet)
- **`verificationTier`**: Enum `HistoricalConfidence` (`HISTORICALLY_DOCUMENTED`, `STRONG_TRADITIONAL_SOURCES`, `PIOUS_TRADITION`)
- **`saintId`**: Foreign Key -> `Saint` (Optional)
- **`prayerId`**: Foreign Key -> `Prayer` (Optional)
- **`novenaId`**: Foreign Key -> `Novena` (Optional)
- **`catechismEntryId`**: Foreign Key -> `CatechismEntry` (Optional)
- **`churchDocumentId`**: Foreign Key -> `ChurchDocument` (Optional)

---

## 8. Infrastructure: Media, SEO, & Migration Provenance

### 8.1 MediaAsset Strategy

Direct image URLs with alt text are stored on models for v1, with an optional normalized `MediaAsset` table for reusable assets (e.g., Saint portraits, relic images).

- **`id`**: String (CUID / UUID)
- **`url`**: String (CDN or storage key)
- **`altText`**: String
- **`caption`**: String (Optional)
- **`attribution`**: String (Optional copyright/license info)
- **`width`**: Integer (Optional)
- **`height`**: Integer (Optional)
- **`mimeType`**: String (Optional)

### 8.2 SEO & Slug Redirect Strategy

#### Per-Content-Type Slug Uniqueness (Approved)
Slugs are scoped and unique **PER CONTENT TYPE** rather than globally across all tables:
- `/saints/joseph`
- `/prayers/joseph`
- `/novenas/joseph`

Each public model enforces a local unique constraint on `slug`: `UNIQUE(slug)` within its entity table.

#### SlugRedirect (301 Redirect Preservation)
Preserves SEO authority when legacy WordPress URLs or slugs change.
- **`id`**: String (CUID / UUID)
- **`contentType`**: String (e.g., `"Saint"`, `"Prayer"`, `"Novena"`)
- **`sourcePath`**: String (Unique source path, e.g., `"/saints/st-thomas"`)
- **`targetPath`**: String (Target path, e.g., `"/saints/st-thomas-aquinas"`)
- **`statusCode`**: Integer (Default: `301`)
- *Constraint:* `UNIQUE(sourcePath)`

### 8.3 Migration Provenance (`MigrationRecord`)

Keeps WordPress migration metadata out of primary application models.

- **`id`**: String (CUID / UUID)
- **`entityType`**: String (e.g., `"Saint"`, `"Prayer"`, `"Reading"`)
- **`entityId`**: String (CUID / UUID of canonical record)
- **`legacyPostId`**: Integer (WordPress `ID`)
- **`legacyPostType`**: String (e.g., `"cc_saint"`, `"cc_reading"`)
- **`legacySlug`**: String (WordPress `post_name`)
- **`legacyUrl`**: String (Original WordPress permalink)
- **`importedAt`**: Timestamp
- *Constraint:* `UNIQUE(legacyPostType, legacyPostId)`

---

## 9. Relationship Cardinalities Inventory

| Entity Pair | Relationship | Cardinality | Join Model / Implementation |
| :--- | :--- | :--- | :--- |
| **Saint <-> Patronage** | Many-to-Many | `M:N` | `SaintPatronage` (`saintId`, `patronageId`) |
| **Saint <-> Vocation** | Many-to-Many | `M:N` | `SaintVocation` (`saintId`, `vocationId`) |
| **Saint <-> Prayer** | Many-to-Many | `M:N` | `SaintPrayer` (`saintId`, `prayerId`) |
| **Saint <-> Novena** | Many-to-Many | `M:N` | `SaintNovena` (`saintId`, `novenaId`) |
| **LiturgicalDay <-> Celebration** | Contextual Many-to-Many | `1:M / M:N` | `LiturgicalDayCelebration` (`liturgicalDayId`, `celebrationId`, `precedenceOrder`) |
| **LiturgicalDay -> Reading** | One-to-Many | `1:M` | `Reading.liturgicalDayId` |
| **Novena -> NovenaDay** | One-to-Many | `1:M` | `NovenaDay.novenaId` (`UNIQUE(novenaId, dayNumber)`) |
| **FormationPathway -> Module** | One-to-Many | `1:M` | `FormationModule.pathwayId` (`UNIQUE(pathwayId, moduleOrder)`) |
| **FormationModule -> Lesson** | One-to-Many | `1:M` | `FormationLesson.moduleId` (`UNIQUE(moduleId, lessonOrder)`) |

---

## 10. Corrected Candidate Enums Specification

1. **`CelebrationRank`**: `SOLEMNITY`, `FEAST`, `MEMORIAL`, `OPTIONAL_MEMORIAL` (Intrinsic ranks defined by Catholic liturgical law. Ferial status is a property of `LiturgicalDay`; commemorations are contextual states on `LiturgicalDayCelebration`).
2. **`LiturgicalColor`**: `GREEN`, `VIOLET`, `WHITE`, `RED`, `ROSE`, `BLACK` (Universal Roman baseline. Local/festive adaptations may exist).
3. **`ReadingType`**: `FIRST_READING`, `RESPONSORIAL_PSALM`, `SECOND_READING`, `GOSPEL_ACCLAMATION`, `GOSPEL`, `OTHER` (Structural reading roles only. Mass timing/formulary contexts belong to celebration/formulary metadata).
4. **`EcclesialStatus`**: `SERVANT_OF_GOD`, `VENERABLE`, `BLESSED`, `SAINT` (Formal stage of canonical recognition by the Catholic Church).
5. **`HistoricalConfidence`**: `HISTORICALLY_DOCUMENTED`, `STRONG_TRADITIONAL_SOURCES`, `PIOUS_TRADITION`
6. **`PrayerType`**: `BASIC`, `MARIAN`, `NOVENA_PRAYER`, `LITANY`, `CREED`, `LITURGICAL`, `CHAPLET`, `DEVOTIONAL`
7. **`CatechismPillar`**: `PART_1_PROFESSION_OF_FAITH`, `PART_2_SACRAMENTS`, `PART_3_LIFE_IN_CHRIST`, `PART_4_CHRISTIAN_PRAYER`
8. **`DocumentType`**: `ENCYCLICAL`, `APOSTOLIC_EXHORTATION`, `BULL`, `MOTU_PROPRIO`, `COUNCIL_CONSTITUTION`, `COUNCIL_DECREE`, `DECLARATION`, `CATECHISM`
9. **`PublicationStatus`**: `DRAFT`, `IN_REVIEW`, `APPROVED`, `PUBLISHED`, `ARCHIVED`
10. **`ReviewType`**: `SOURCE_VERIFICATION`, `DOCTRINAL_REVIEW`, `EDITORIAL_REVIEW`
11. **`ReviewStatus`**: `PENDING`, `APPROVED`, `REJECTED`, `REVISION_REQUESTED`
12. **`SourceType`**: `CANONICAL_SCRIPTURE`, `MAGISTERIAL_DOCUMENT`, `PATRISTIC_TEXT`, `HISTORICAL_RECORD`, `TRADITIONAL_BIOGRAPHY`, `CATECHISM`

---

## 11. M0.2 Decision Register

### APPROVED DECISIONS
- **Canonical LiturgicalDay / Celebration Separation:** Temporal day context (`LiturgicalDay`) separated from liturgical observances (`Celebration`).
- **Contextual LiturgicalDayCelebration Join:** Join table representing precedence, optional memorials, commemorations, and transfers.
- **Normalized Reading Records:** Reading texts normalized into individual `Reading` entities rather than flat columns.
- **Relational NovenaDay:** Multi-day novena steps modeled relationally via `NovenaDay` (`UNIQUE(novenaId, dayNumber)`).
- **Relational Patronage & Vocation:** Normalized `Patronage` and `Vocation` models with M:N join tables to `Saint`.
- **Formation Hierarchy:** 3-tier hierarchy (`FormationPathway` -> `FormationModule` -> `FormationLesson`).
- **Centralized MigrationRecord Strategy:** WordPress legacy IDs and URLs stored in `MigrationRecord` rather than polluting core domain models.
- **Saint Feast-Date Option C:** Primary liturgical observances live in `Celebration`; `Saint.feastDateMonth`/`day` scalars retained ONLY for convenience/devotional browsing metadata (MUST NOT be used for calendar computation).
- **Per-Content-Type Slug Uniqueness:** Slugs are unique per content type family (e.g. `/saints/joseph`, `/prayers/joseph`).

### RECOMMENDED BUT NOT YET IMPLEMENTED
- **Source / Citation Architecture:** Catalog model `Source` + join model `Citation`.
- **MediaAsset:** Reusable image/asset metadata table.
- **ContentReview:** Editorial and doctrinal review tracking model.
- **SlugRedirect:** 301 URL redirect preservation model.
- **SEO Metadata Architecture:** Embedded 1:1 SEO records on public content entities.

### FUTURE / DEFERRED
- **Liturgical Precedence Engine:** Liturgical calendar computation algorithms.
- **Regional / Local Calendar Implementation:** Calendar codes and regional overrides.
- **Mass Formulary Variants:** Vigil vs Mass During the Day formulary selections.
- **User Progress Tracking:** Formation course progress tracking.
- **Authentication & Reviewer Identities:** User accounts and reviewer identity models.
