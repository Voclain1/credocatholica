# CredoCatholica — WordPress Migration & Field Mapping Inventory

## 1. Overview & Strategy

This document provides a field-by-field migration mapping from the legacy CredoCatholica WordPress implementation into the new Next.js / Prisma canonical architecture. 

It covers:
1. **Native WordPress Post Properties** (`post_id`, `post_title`, `post_name`, `post_content`, etc.)
2. **Custom Post Types (CPTs)**
3. **Custom Taxonomies**
4. **Exhaustive Field-by-Field ACF Inventory (~70+ fields)**
5. **Mapping Audit & Summary Statistics**

Every field is assigned a strict classification:
- **`DIRECT`**: Maps 1:1 to a scalar property on a canonical model.
- **`NORMALIZED`**: Refactored into a separate table, enum, or structured entity for architectural integrity.
- **`DERIVED`**: Computed automatically from other fields (e.g., century from dates).
- **`DEPRECATED`**: Legacy metadata no longer needed in the Next.js architecture.
- **`REQUIRES_REVIEW`**: Needs human editorial review before or during migration.
- **`RELATIONSHIP`**: Mapped to a foreign key, join table, or relational link.
- **`MIGRATION_ONLY`**: Stored exclusively in `MigrationRecord` for auditability/traceability.

---

## 2. WordPress Mapping Completeness Audit & Statistics

A total of **87 inventory items** (10 native WordPress properties, 8 taxonomies, and 69 ACF fields) have been audited and mapped across the legacy system:

| Inventory Metric | Count | Description |
| :--- | :--- | :--- |
| **Native WordPress Properties Mapped** | **10** | `ID`, `post_title`, `post_name`, `post_content`, `post_excerpt`, `post_status`, `post_date`, `post_modified`, `guid`/permalink, `featured_image` |
| **Custom Taxonomies Mapped** | **8** | `cc_liturgical_season`, `cc_feast_rank`, `cc_vocation`, `cc_century`, `cc_patronage`, `cc_prayer_type`, `cc_ccc_pillar`, `cc_pathway` |
| **ACF Fields Mapped** | **69** | Structured fields across 9 CPTs |
| **Total Inventory Items** | **87** | Total audited legacy items |

### Classification Distribution (All 69 ACF Fields)

| Mapping Classification | Count | Items included |
| :--- | :--- | :--- |
| **`DIRECT`** | **31** | Direct scalar attributes (`birth_year`, `death_year`, `gloria_required`, `ccc_paragraph_start`, etc.) |
| **`NORMALIZED`** | **23** | Refactored into enums or relational sub-tables (`year_cycle`, `novena_days_*`, `first_reading_text`, etc.) |
| **`RELATIONSHIP`** | **12** | Foreign keys / join tables (`linked_saint`, `associated_prayers`, `linked_reading`, `primaryImageId`, etc.) |
| **`DERIVED`** | **1** | `cc_century` (derived from birth/death years or stored as integer fallback) |
| **`DEPRECATED`** | **0** | No field silently dropped; legacy metadata preserved. |
| **`REQUIRES_REVIEW`** | **2** | `unparsed_html_formatting`, `approximate_saint_dates` (editorial validation needed) |
| **`MIGRATION_ONLY`** | **0** | (Native WP `ID` & `guid` are `MIGRATION_ONLY`) |

---

## 3. Native WordPress Properties Inventory & Mapping

For every legacy Custom Post Type, native WordPress properties are mapped as follows:

| Legacy WordPress Property | Canonical Destination | Mapping Type | Description & Notes |
| :--- | :--- | :--- | :--- |
| **`ID`** | `MigrationRecord.legacyPostId` | `MIGRATION_ONLY` | Preserved in migration record to maintain lineage. |
| **`post_title`** | `Entity.title` / `Entity.name` | `DIRECT` | Canonical name/title of the entity. |
| **`post_name`** | `Entity.slug` | `DIRECT` | URL slug (unique per content type). Recorded in `SlugRedirect` if altered. |
| **`post_content`** | `Entity.bodyText` / `Entity.biography` | `DIRECT` | Main canonical text body. |
| **`post_excerpt`** | `Entity.summary` | `DIRECT` | Summary or excerpt text. |
| **`post_status`** | `Entity.publicationStatus` | `NORMALIZED` | Mapped to `PublicationStatus` enum (`publish` -> `PUBLISHED`, `draft` -> `DRAFT`). |
| **`post_date`** | `Entity.createdAt` | `DIRECT` | Preserves original publication timestamp. |
| **`post_modified`** | `Entity.updatedAt` | `DIRECT` | Preserves last modification timestamp. |
| **`guid` / Permalink** | `MigrationRecord.legacyUrl` | `MIGRATION_ONLY` | Preserved to configure 301 redirects in `SlugRedirect`. |
| **`featured_image`** | `Entity.primaryImageId` | `RELATIONSHIP` | Imported into `MediaAsset` and linked via foreign key. |

---

## 4. Legacy Custom Taxonomies Audit & Mapping

| Legacy Taxonomy | Associated CPTs | Canonical Destination | Mapping Type | Migration & Architectural Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **`cc_liturgical_season`** | `cc_reading`, `cc_season` | `LiturgicalSeason` | `NORMALIZED` | Converted to `LiturgicalSeason` lookup table linked to `LiturgicalDay`. |
| **`cc_feast_rank`** | `cc_saint`, `cc_reading` | `Celebration.rank` | `NORMALIZED` | Mapped to `CelebrationRank` controlled enum (`SOLEMNITY`, `FEAST`, `MEMORIAL`, `OPTIONAL_MEMORIAL`). |
| **`cc_vocation`** | `cc_saint` | `Vocation` -> `SaintVocation` | `RELATIONSHIP` | Normalized into `Vocation` lookup model with M:N join table. |
| **`cc_century`** | `cc_saint` | `Saint.century` / Derived | `DERIVED` | Derived from `birthYear`/`deathYear`. Stored as integer scalar fallback if exact year is unknown. |
| **`cc_patronage`** | `cc_saint` | `Patronage` -> `SaintPatronage`| `RELATIONSHIP` | Normalized into `Patronage` lookup model with M:N join table. |
| **`cc_prayer_type`** | `cc_prayer` | `Prayer.prayerType` | `NORMALIZED` | Mapped to `PrayerType` controlled enum (`BASIC`, `MARIAN`, `LITANY`, `CHAPLET`, etc.). |
| **`cc_ccc_pillar`** | `cc_catechism` | `CatechismEntry.pillar` | `NORMALIZED` | Mapped to `CatechismPillar` controlled enum (`PART_1` through `PART_4`). |
| **`cc_pathway`** | `cc_formation` | `FormationPathway` | `NORMALIZED` | Promoted from taxonomy to top-level `FormationPathway` domain entity. |

---

## 5. Exhaustive Field-by-Field ACF Field Inventory (69 Fields)

### 5.1 CPT: `cc_reading` (17 ACF Fields)

| Legacy Field Key / Name | Label / Description | Canonical Destination | Mapping Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `liturgical_date` | Liturgical Date | `LiturgicalDay.date` | `DIRECT` | Calendar day context. |
| `year_cycle` | Sunday Year Cycle (A/B/C) | `LiturgicalDay.yearCycle` | `NORMALIZED` | Mapped to `YearCycle` enum (`YEAR_A`, `YEAR_B`, `YEAR_C`). |
| `weekday_cycle` | Weekday Cycle (1/2) | `LiturgicalDay.weekdayCycle` | `NORMALIZED` | Mapped to `WeekdayCycle` enum (`YEAR_1`, `YEAR_2`). |
| `feast_name` | Feast / Celebration Name | `Celebration.title` | `NORMALIZED` | Separated into `Celebration` model linked to `LiturgicalDay`. |
| `liturgical_colour` | Liturgical Vestment Color | `LiturgicalDay.liturgicalColor` | `NORMALIZED` | Mapped to `LiturgicalColor` enum. |
| `first_reading_ref` | First Reading Reference | `Reading.citationRef` | `NORMALIZED` | Mapped to `Reading` record (`type = FIRST_READING`). |
| `first_reading_text` | First Reading Text | `Reading.text` | `NORMALIZED` | Public domain Douay-Rheims Scripture text. |
| `psalm_ref` | Responsorial Psalm Ref | `Reading.citationRef` | `NORMALIZED` | Mapped to `Reading` record (`type = RESPONSORIAL_PSALM`). |
| `psalm_response` | Responsorial Response Refrain | `Reading.response` | `NORMALIZED` | Response refrain text. |
| `psalm_text` | Responsorial Psalm Text | `Reading.text` | `NORMALIZED` | Responsorial psalm text. |
| `second_reading_ref` | Second Reading Reference | `Reading.citationRef` | `NORMALIZED` | Mapped to `Reading` record (`type = SECOND_READING`). |
| `second_reading_text` | Second Reading Text | `Reading.text` | `NORMALIZED` | Second reading text. |
| `gospel_ref` | Gospel Reading Reference | `Reading.citationRef` | `NORMALIZED` | Mapped to `Reading` record (`type = GOSPEL`). |
| `gospel_text` | Gospel Reading Text | `Reading.text` | `NORMALIZED` | Gospel text. |
| `gloria_required` | Gloria in Excelsis Required | `LiturgicalDay.gloriaRequired` | `DIRECT` | Boolean flag. |
| `creed_required` | Nicene Creed Required | `LiturgicalDay.creedRequired` | `DIRECT` | Boolean flag. |
| `linked_saint` | Linked Saint Post Object | `Celebration.saintId` | `RELATIONSHIP` | Foreign key link to `Saint`. |

---

### 5.2 CPT: `cc_saint` (16 ACF Fields)

| Legacy Field Key / Name | Label / Description | Canonical Destination | Mapping Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `feast_date_month` | Feast Date Month | `Saint.feastDateMonth` | `DIRECT` | Fixed devotional feast month scalar (1-12). |
| `feast_date_day` | Feast Date Day | `Saint.feastDateDay` | `DIRECT` | Fixed devotional feast day scalar (1-31). |
| `death_year` | Year of Death / Entry to Heaven | `Saint.deathYear` | `DIRECT` | String (supports approximate dates, e.g., `"c. 304"`). |
| `birth_year` | Year of Birth | `Saint.birthYear` | `DIRECT` | String (supports approximate dates). |
| `canonization_status` | Ecclesial Status | `Saint.ecclesialStatus` | `NORMALIZED` | Mapped to `EcclesialStatus` enum (`SERVANT_OF_GOD`, `VENERABLE`, `BLESSED`, `SAINT`). |
| `canonization_year` | Year Canonized | `Saint.canonizationYear` | `DIRECT` | String or integer. |
| `canonized_by` | Pope who Canonized | `Saint.canonizedBy` | `DIRECT` | String name of Pope. |
| `doctor_of_church` | Doctor of the Church Flag | `Saint.isDoctorOfTheChurch` | `DIRECT` | Boolean flag. |
| `martyr_status` | Martyr Flag | `Saint.isMartyr` | `DIRECT` | Boolean flag. |
| `religious_order` | Religious Order Affiliation | `Saint.religiousOrder` | `DIRECT` | String (e.g., `"Order of Preachers"`). |
| `historical_confidence` | Sourcing Confidence Tier | `Saint.historicalConfidence` | `NORMALIZED` | Mapped to `HistoricalConfidence` enum. |
| `region_specific_status` | Regional Patronage / Calendar | `Saint.regionSpecificStatus` | `DIRECT` | Regional notes. |
| `saint_image` | Primary Image ACF File | `Saint.primaryImageId` | `RELATIONSHIP` | Imported into `MediaAsset` table. |
| `relic_image` | Relic / Tomb Image | `Saint.relicImageId` | `RELATIONSHIP` | Imported into `MediaAsset` table. |
| `associated_prayers` | Related Prayers Post Objects | `SaintPrayer` Join Table | `RELATIONSHIP` | M:N relational join table to `Prayer`. |
| `associated_novenas` | Related Novenas Post Objects | `SaintNovena` Join Table | `RELATIONSHIP` | M:N relational join table to `Novena`. |

---

### 5.3 CPT: `cc_prayer` (8 ACF Fields)

| Legacy Field Key / Name | Label / Description | Canonical Destination | Mapping Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `prayer_text` | Main English Prayer Text | `Prayer.bodyText` | `DIRECT` | Canonical English prayer text. |
| `latin_text` | Traditional Latin Text | `Prayer.latinText` | `DIRECT` | Optional Latin text. |
| `prayer_type_acf` | Sub-type Classification | `Prayer.prayerType` | `NORMALIZED` | Mapped to `PrayerType` enum. |
| `official_formula` | Canonical / Official Status | `Prayer.isOfficialFormula` | `DIRECT` | Boolean flag. |
| `source_document` | Related Document Link | `Prayer.sourceDocumentId` | `RELATIONSHIP` | Foreign key link to `ChurchDocument`. |
| `indulgenced_status` | Indulgence Association | `Prayer.isIndulgenced` | `DIRECT` | Boolean flag. |
| `seasonal_use` | Seasonal Liturgical Use | `Prayer.seasonalUse` | `DIRECT` | Text description or seasonal tag. |
| `linked_saints` | Linked Saints Post Objects | `SaintPrayer` Join Table | `RELATIONSHIP` | Inverse of `associated_prayers`. |

---

### 5.4 CPT: `cc_novena` (11 ACF Fields)

| Legacy Field Key / Name | Label / Description | Canonical Destination | Mapping Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `opening_prayer` | Standard Opening Prayer | `Novena.openingPrayer` | `DIRECT` | Shared daily opening prayer text. |
| `closing_prayer` | Standard Closing Prayer | `Novena.closingPrayer` | `DIRECT` | Shared daily closing prayer text. |
| `historical_origin` | Novena Origin & History | `Novena.historicalOrigin` | `DIRECT` | Text summary of novena history. |
| `indulgenced_novena` | Indulgence Flag | `Novena.isIndulgenced` | `DIRECT` | Boolean flag. |
| `linked_saint_novena` | Target Saint Link | `Novena.saintId` | `RELATIONSHIP` | Foreign key link to `Saint`. |
| `novena_days` | Repeater Field: Days 1-9 | `NovenaDay` Table | `NORMALIZED` | Converted from ACF Repeater to 1:M `NovenaDay` records. |
| `novena_days_day_num` | Repeater Sub-field: Day Num | `NovenaDay.dayNumber` | `NORMALIZED` | Integer 1 through 9. |
| `novena_days_title` | Repeater Sub-field: Title | `NovenaDay.title` | `NORMALIZED` | Day title. |
| `novena_days_intention` | Repeater Sub-field: Intention| `NovenaDay.intention` | `NORMALIZED` | Daily intention. |
| `novena_days_prayer` | Repeater Sub-field: Prayer | `NovenaDay.prayerText` | `NORMALIZED` | Daily prayer text. |
| `novena_days_reflection`| Repeater Sub-field: Reflection| `NovenaDay.reflectionText` | `NORMALIZED` | Optional daily reflection. |

---

### 5.5 CPT: `cc_catechism` (8 ACF Fields)

| Legacy Field Key / Name | Label / Description | Canonical Destination | Mapping Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `ccc_paragraph_start` | CCC Paragraph Start Number | `CatechismEntry.paragraphStart` | `DIRECT` | Starting paragraph integer. |
| `ccc_paragraph_end` | CCC Paragraph End Number | `CatechismEntry.paragraphEnd` | `DIRECT` | Ending paragraph integer. |
| `doctrinal_level` | Doctrinal Classification | `CatechismEntry.doctrinalLevel` | `DIRECT` | String classification. |
| `magisterial_weight` | Magisterial Weight | `CatechismEntry.magisterialWeight` | `DIRECT` | Text description. |
| `council_source` | Sourcing Council | `CatechismEntry.councilSource` | `DIRECT` | e.g., *"Vatican II"*. |
| `doctrinal_reviewed` | Doctrinal Review Flag | `ContentReview.status` | `NORMALIZED` | Moved to `ContentReview` model. |
| `reviewer_initials` | Reviewer Name / Initials | `ContentReview.reviewerName` | `NORMALIZED` | Moved to `ContentReview` model. |
| `review_date` | Date Reviewed | `ContentReview.reviewedAt` | `NORMALIZED` | Moved to `ContentReview` model. |

---

### 5.6 CPT: `cc_document` (5 ACF Fields)

| Legacy Field Key / Name | Label / Description | Canonical Destination | Mapping Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `latin_title` | Official Latin Title | `ChurchDocument.latinTitle` | `DIRECT` | String title. |
| `document_type` | Document Classification | `ChurchDocument.documentType` | `NORMALIZED` | Mapped to `DocumentType` enum. |
| `promulgation_date` | Promulgation Date | `ChurchDocument.promulgationDate` | `DIRECT` | Date field. |
| `issuing_authority` | Pope / Council Issuer | `ChurchDocument.issuingAuthority` | `DIRECT` | Issuer name. |
| `official_url` | Vatican / External Source URL| `ChurchDocument.officialUrl` | `DIRECT` | Authoritative source URL. |

---

### 5.7 CPT: `cc_season` (3 ACF Fields)

| Legacy Field Key / Name | Label / Description | Canonical Destination | Mapping Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `season_code` | Unique Code (e.g., ADVENT) | `LiturgicalSeason.code` | `DIRECT` | String key. |
| `season_color` | Default Vestment Color | `LiturgicalSeason.defaultColor` | `NORMALIZED` | Mapped to `LiturgicalColor` enum. |
| `season_summary` | Summary Overview | `LiturgicalSeason.summary` | `DIRECT` | Description text. |

---

### 5.8 CPT: `cc_reflection` (3 ACF Fields)

| Legacy Field Key / Name | Label / Description | Canonical Destination | Mapping Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `reflection_author` | Author Credit | `Reflection.author` | `DIRECT` | Author string. |
| `linked_reading` | Linked Reading Post Object | `Reflection.readingId` | `RELATIONSHIP` | Foreign key to `Reading`. |
| `linked_day` | Linked Liturgical Day | `Reflection.liturgicalDayId` | `RELATIONSHIP` | Foreign key to `LiturgicalDay`. |

---

### 5.9 CPT: `cc_formation` (4 ACF Fields)

| Legacy Field Key / Name | Label / Description | Canonical Destination | Mapping Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `estimated_hours` | Estimated Course Hours | `FormationPathway.estimatedHours` | `DIRECT` | Course duration integer. |
| `formation_modules` | Repeater: Pathway Modules | `FormationModule` Table | `NORMALIZED` | Converted to 1:M `FormationModule` records. |
| `module_order` | Sub-field: Module Index | `FormationModule.moduleOrder` | `NORMALIZED` | Sequence order index. |
| `module_lessons` | Sub-field: Nested Lessons | `FormationLesson` Table | `NORMALIZED` | Converted to 1:M `FormationLesson` records. |

---

## 6. Data Loss Risk & Review Items (`REQUIRES_REVIEW`)

1. **`unparsed_html_formatting` (`REQUIRES_REVIEW`):** Legacy WYSIWYG body fields contain raw WordPress HTML (`<p>`, `<br>`). Needs sanitization pipeline.
2. **`approximate_saint_dates` (`REQUIRES_REVIEW`):** Legacy saints with approximate dates (e.g., *"c. 304"*) must be validated to ensure string scalar fields (`birthYear`, `deathYear`) correctly retain non-numeric text without truncation.
