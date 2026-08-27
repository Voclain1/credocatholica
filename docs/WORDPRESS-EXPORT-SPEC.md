# CredoCatholica — WordPress Source Export Specification

## 1. Executive Summary & Source Contract

This document defines the strict, unambiguous source package export contract required for extracting legacy data from the CredoCatholica WordPress installation and preparing it for ingestion by the Next.js / PostgreSQL migration pipeline.

### Core Export Principles

1. **Normalized ACF is the Canonical Input Contract:** The migration pipeline expects logical, normalized ACF field values per post rather than requiring the consumer to parse raw WP `postmeta` key-value pairs or internal ACF database storage logic.
2. **Explicit Taxonomy Relationships:** Taxonomy term assignments must be explicitly exported via full term definitions (`terms.json`), taxonomy definitions (`term-taxonomy.json`), and object relationships (`term-relationships.json`).
3. **Non-Destructive Sourcing:** Sourcing is strictly read-only and non-destructive to the live WordPress instance.

---

## 2. Export Package File Structure

The export package must be generated as a directory containing 6 JSON files under:

```
scripts/wordpress-migration/input/
  ├── posts.json
  ├── postmeta.json
  ├── terms.json
  ├── term-taxonomy.json
  ├── term-relationships.json
  └── media.json
```

---

## 3. Detailed File Contracts

### 3.1 `posts.json`

Contains all native WordPress post records for supported Custom Post Types (`cc_reading`, `cc_saint`, `cc_prayer`, `cc_novena`, `cc_catechism`, `cc_season`, `cc_reflection`, `cc_document`, `cc_formation`), plus normalized ACF values.

```json
[
  {
    "ID": 101,
    "post_type": "cc_saint",
    "post_title": "Saint Francis of Assisi",
    "post_name": "st-francis-of-assisi",
    "post_content": "<p>Saint Francis was born in Assisi...</p>",
    "post_excerpt": "Founder of the Franciscan Order and patron of ecology.",
    "post_status": "publish",
    "post_date": "2024-01-15 10:00:00",
    "post_modified": "2024-06-01 12:30:00",
    "guid": "https://credocatholica.com/?post_type=cc_saint&p=101",
    "featured_media_id": 501,
    "acf": {
      "biography_teaser": "Patron Saint of Animals & Ecology",
      "birth_year": "1181",
      "death_year": "1226",
      "century": 13,
      "feast_date_month": 10,
      "feast_date_day": 4,
      "ecclesial_status": "Saint",
      "canonization_year": "1228",
      "canonized_by": "Pope Gregory IX",
      "is_doctor_of_church": false,
      "is_martyr": false,
      "religious_order": "Order of Friars Minor (Franciscans)",
      "historical_confidence": "Historically Documented",
      "region_specific_status": "Universal",
      "relic_image_id": 502,
      "linked_prayers": [201, 202],
      "linked_novenas": [301]
    }
  }
]
```

### 3.2 `postmeta.json`

Contains non-ACF custom metadata or raw metadata fallback. Used only when metadata cannot be normalized into `posts.json[].acf`.

```json
[
  {
    "meta_id": 1001,
    "post_id": 101,
    "meta_key": "_legacy_source_system",
    "meta_value": "wp_v1"
  }
]
```

### 3.3 `terms.json`

Defines all taxonomy term objects across native and custom WordPress taxonomies (`cc_patronage`, `cc_vocation`, `cc_liturgical_season`, `cc_feast_rank`, `cc_prayer_type`, `cc_ccc_pillar`, `cc_pathway`, `cc_century`).

```json
[
  {
    "term_id": 12,
    "name": "Ecology & Animals",
    "slug": "ecology-animals"
  }
]
```

### 3.4 `term-taxonomy.json`

Maps terms to their specific taxonomy context and hierarchy.

```json
[
  {
    "term_taxonomy_id": 12,
    "term_id": 12,
    "taxonomy": "cc_patronage",
    "description": "Patronages related to creation and nature",
    "parent": 0,
    "count": 5
  }
]
```

### 3.5 `term-relationships.json`

Defines many-to-many assignments between WordPress posts and term taxonomy instances.

```json
[
  {
    "object_id": 101,
    "term_taxonomy_id": 12,
    "term_order": 0
  }
]
```

### 3.6 `media.json`

Contains media attachment metadata for resolving images, portraits, and relic photos.

```json
[
  {
    "attachment_id": 501,
    "url": "https://credocatholica.com/wp-content/uploads/2024/01/st-francis.jpg",
    "filename": "st-francis.jpg",
    "mime_type": "image/jpeg",
    "title": "Saint Francis Portrait",
    "caption": "13th century painting of St Francis",
    "alt_text": "Portrait of Saint Francis of Assisi",
    "width": 800,
    "height": 1000
  }
]
```

---

## 4. Specific CPT ACF Normalization Contracts

### 4.1 `cc_reading`

- `liturgical_date`: `"YYYY-MM-DD"`
- `year_cycle`: `"Year A"`, `"Year B"`, or `"Year C"`
- `weekday_cycle`: `"Year 1"` or `"Year 2"`
- `feast_name`: Optional raw feast name string
- `liturgical_colour`: `"Green"`, `"Violet"`, `"White"`, `"Red"`, `"Rose"`, or `"Black"`
- `first_reading_ref`, `first_reading_text`
- `psalm_ref`, `psalm_response`, `psalm_text`
- `second_reading_ref`, `second_reading_text`
- `gospel_acclamation_ref`, `gospel_acclamation_text`
- `gospel_ref`, `gospel_text`
- `gloria_required`: boolean
- `creed_required`: boolean
- `linked_saint`: Optional post ID (number)

### 4.2 `cc_novena`

- `summary`: text
- `opening_prayer`: text
- `closing_prayer`: text
- `historical_origin`: text
- `is_indulgenced`: boolean
- `linked_saint`: Optional post ID (number)
- `novena_days`: Normalized array of objects:
  ```json
  [
    {
      "day_number": 1,
      "day_title": "Day 1: Faithfulness",
      "intention": "For strength in trial...",
      "day_prayer": "O Holy Saint...",
      "day_reflection": "Meditation text..."
    }
  ]
  ```

---

## 5. Excluded Data

The export package **MUST NOT** include:
- User passwords, hashes, or personal user details;
- WordPress options, transients, or plugin settings (`wp_options`);
- WordPress comments (`wp_comments`);
- Database credentials or API tokens;
- Raw HTML themes or template files.
