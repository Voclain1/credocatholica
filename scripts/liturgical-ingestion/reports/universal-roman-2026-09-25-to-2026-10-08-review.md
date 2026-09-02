# Liturgical Ingestion Package Human Review & Doctrinal Audit Report
**Package Target:** `universal-roman-2026-09-25-to-2026-10-08`  
**Date Range Covered:** 2026-09-25 through 2026-10-08 (14 consecutive Universal Roman Calendar dates)  
**Package Version:** `1.2.0`  
**Scripture Translation:** Douay-Rheims Version, Challoner Revision  
**Package SHA-256 Hash:** `b871a368a76b572420ae1c7b699e881b322f62a66aeeb4c14dfa1f68908b9368`  
**Validation Results:** `0 Blockers, 0 Warnings`  
**Dry-Run Verdict:** **`READY_FOR_HUMAN_APPROVAL`**

---

## 1. Executive Summary & Batch Scope

This document provides the human editorial and doctrinal review report for the Phase M0.9 Fourth Controlled Expansion Batch of Universal Roman Calendar liturgical data covering **25 September 2026 through 8 October 2026**.

The package incorporates all requested source & content corrections:
1. **September 29 (Saints Michael, Gabriel, Raphael Archangels — Feast):** Modeled with TWO complete self-contained `ALTERNATIVE` ReadingSets (`lectionaryNumber = "647"`, `context = PROPER_OF_SAINTS`):
   - Option A (`set-0929-proper-647-daniel`): First Reading Daniel 7:9-10, 13-14 + Responsorial Psalm **Psalm 138:1-2ab, 2cde-3, 4-5** (D-R Ps 137:1-2, 2-3, 4-5) + Gospel John 1:47-51.
   - Option B (`set-0929-proper-647-revelation`): First Reading Revelation 12:7-12ab (`scriptureRef: Apocalypse 12:7-12`) + Responsorial Psalm **Psalm 138:1-2ab, 2cde-3, 4-5** (D-R Ps 137:1-2, 2-3, 4-5) + Gospel John 1:47-51.
2. **October 5 (Saint Faustina Kowalska — Optional Memorial):** Modeled with TWO complete `ALTERNATIVE` ReadingSets:
   - Weekday Set (`set-1005-weekday-461`, Lectionary 461, `context: WEEKDAY`).
   - Dedicated Proper Set (`set-1005-proper-651b`, Lectionary `"651B"`, `context: PROPER_OF_SAINTS`, Eph 3:14-19 | Ps 103:1bc-2, 3-4, 8-9, 13-14, 17-18a | Mt 11:25-30).
3. **October 6 (Saint Bruno — Optional Memorial):** Modeled with TWO complete `ALTERNATIVE` ReadingSets:
   - Weekday Set (`set-1006-weekday-462`, Lectionary 462, `context: WEEKDAY`).
   - Dedicated Proper Set (`set-1006-proper-652`, Lectionary `"652"`, `context: PROPER_OF_SAINTS`, Phil 3:8-14 | Ps 1:1-2, 3, 4 and 6 | Lk 9:57-62).
4. **October 7 (Our Lady of the Rosary — Memorial):** Dedicated proper Lectionary number corrected to **`653`** (`set-1007-proper-653`, Lectionary `"653"`, `context: PROPER_OF_SAINTS`, Acts 1:12-14 | Luke 1:46-55 Magnificat | Luke 1:26-38).

---

## 2. Date-by-Date Review

### 2026-09-25 (Friday, 25th Week in Ordinary Time)
- **Temporal Title:** Friday of the Twenty-fifth Week in Ordinary Time
- **Season/Week:** `ORDINARY_TIME` / Week 25 / `YEAR_A` / `YEAR_2`
- **Observance:** Feria (`principalCelebration: null`, `secondaryCelebrations: []`)
- **Color:** `GREEN` | **Gloria:** `false` | **Creed:** `false`
- **Lectionary Number:** 453
- **ReadingSet:** `set-0925-weekday-453` (`context: WEEKDAY`, `selectionStatus: SOLE_SET`, `isCanonicalDefault: true`)
- **Citations:**
  - First Reading: Ecclesiastes 3:1-11 (`reading-0925-weekday-first-eccl3`)
  - Responsorial Psalm: Psalm 144:1b and 2abc, 3-4 (`scriptureRef: Psalm 143:1-2, 3-4`, `reading-0925-weekday-psalm-144`)
  - Gospel: Luke 9:18-22 (`reading-0925-weekday-gospel-luke9`)

### 2026-09-26 (Saturday, 25th Week in Ordinary Time / Saints Cosmas and Damian)
- **Temporal Title:** Saturday of the Twenty-fifth Week in Ordinary Time
- **Season/Week:** `ORDINARY_TIME` / Week 25 / `YEAR_A` / `YEAR_2`
- **Celebration:** Saints Cosmas and Damian, Martyrs (`rank: OPTIONAL_MEMORIAL`, `color: RED`, `isOptional: true`)
- **Principal Celebration:** `null`
- **Color:** `GREEN` | **Gloria:** `false` | **Creed:** `false`
- **ReadingSets:** 2 Alternative Sets
  - **Set 1 (Temporal Weekday):** `set-0926-weekday-454` (`context: WEEKDAY`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 454)
    - Ecclesiastes 11:9--12:8 | Psalm 90:3-4, 5-6, 12-13, 14 and 17 (D-R Ps 89) | Luke 9:43b-45
  - **Set 2 (Proper Memorial):** `set-0926-proper-644` (`context: PROPER_OF_SAINTS`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 644)
    - Wisdom 3:1-9 | Psalm 126:1bc-2ab, 2cd-3, 4-5, 6 (D-R Ps 125) | Matthew 10:28-33

### 2026-09-27 (Twenty-sixth Sunday in Ordinary Time)
- **Temporal Title:** Twenty-sixth Sunday in Ordinary Time
- **Season/Week:** `ORDINARY_TIME` / Week 26 / `YEAR_A` / `YEAR_2`
- **Displaced Observance:** St. Vincent de Paul, Priest (Displaced by Sunday precedence)
- **Celebration Row:** None created for Ordinary Sunday
- **Color:** `GREEN` | **Gloria:** `true` | **Creed:** `true`
- **Lectionary Number:** 136
- **ReadingSet:** `set-0927-sunday-136` (`context: SUNDAY`, `selectionStatus: SOLE_SET`, `isCanonicalDefault: true`)
- **Citations:**
  - First Reading: Ezekiel 18:25-28 (`reading-0927-sunday-first-ezekiel18`)
  - Responsorial Psalm: Psalm 25:4-5, 6-7, 8-9 (`scriptureRef: Psalm 24:4-5, 6-7, 8-9`, `reading-0927-sunday-psalm-25`)
  - Second Reading: Philippians 2:1-11 (`reading-0927-sunday-second-phil2`)
  - Gospel: Matthew 21:28-32 (`reading-0927-sunday-gospel-matt21`)

### 2026-09-28 (Monday, 26th Week / St. Wenceslaus / St. Lawrence Ruiz & Companions)
- **Temporal Title:** Monday of the Twenty-sixth Week in Ordinary Time
- **Season/Week:** `ORDINARY_TIME` / Week 26 / `YEAR_A` / `YEAR_2`
- **Celebrations:**
  1. Saint Wenceslaus, Martyr (`rank: OPTIONAL_MEMORIAL`, `color: RED`, `isOptional: true`, `precedenceOrder: 1`)
  2. Saint Lawrence Ruiz and Companions, Martyrs (`rank: OPTIONAL_MEMORIAL`, `color: RED`, `isOptional: true`, `precedenceOrder: 2`)
- **Principal Celebration:** `null`
- **Color:** `GREEN` | **Gloria:** `false` | **Creed:** `false`
- **Lectionary Number:** 455
- **ReadingSet:** `set-0928-weekday-455` (`context: WEEKDAY`, `selectionStatus: SOLE_SET`, `isCanonicalDefault: true`)
- **Citations:**
  - First Reading: Job 1:6-22 (`reading-0928-weekday-first-job1`)
  - Responsorial Psalm: Psalm 17:1, 2-3, 6-7 (`scriptureRef: Psalm 16:1, 2-3, 6-7`, `reading-0928-weekday-psalm-17`)
  - Gospel: Luke 9:46-50 (`reading-0928-weekday-gospel-luke9`)

### 2026-09-29 (Saints Michael, Gabriel and Raphael, Archangels)
- **Temporal Title:** Saints Michael, Gabriel and Raphael, Archangels
- **Season/Week:** `ORDINARY_TIME` / Week 26 / `YEAR_A` / `YEAR_2`
- **Celebration:** Saints Michael, Gabriel and Raphael, Archangels (`rank: FEAST`, `color: WHITE`, `isOptional: false`)
- **Color:** `WHITE` | **Gloria:** `true` | **Creed:** `false`
- **ReadingSets:** 2 Alternative Sets (Lectionary 647)
  - **Option A (Daniel 7):** `set-0929-proper-647-daniel` (`context: PROPER_OF_SAINTS`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`)
    - Daniel 7:9-10, 13-14 | Psalm 138:1-2ab, 2cde-3, 4-5 (D-R Ps 137:1-2, 2-3, 4-5) | John 1:47-51
  - **Option B (Revelation 12):** `set-0929-proper-647-revelation` (`context: PROPER_OF_SAINTS`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`)
    - Revelation 12:7-12ab | Psalm 138:1-2ab, 2cde-3, 4-5 (D-R Ps 137:1-2, 2-3, 4-5) | John 1:47-51

### 2026-09-30 (Saint Jerome, Priest and Doctor of the Church)
- **Temporal Title:** Saint Jerome, Priest and Doctor of the Church
- **Season/Week:** `ORDINARY_TIME` / Week 26 / `YEAR_A` / `YEAR_2`
- **Celebration:** Saint Jerome, Priest and Doctor of the Church (`rank: MEMORIAL`, `color: WHITE`, `isOptional: false`)
- **Color:** `WHITE` | **Gloria:** `false` | **Creed:** `false`
- **ReadingSets:** 2 Alternative Sets
  - **Set 1 (Temporal Weekday):** `set-0930-weekday-457` (`context: WEEKDAY`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 457)
    - Job 9:1-12, 14-16 | Psalm 88:10bc-11, 12-13, 14-15 (D-R Ps 87) | Luke 9:57-62
  - **Set 2 (Proper Memorial):** `set-0930-proper-648` (`context: PROPER_OF_SAINTS`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 648)
    - 2 Timothy 3:14-17 | Psalm 119:9, 10, 11, 12, 13, 14 (D-R Ps 118) | Matthew 13:47-52

### 2026-10-01 (Saint Thérèse of the Child Jesus, Virgin and Doctor of the Church)
- **Temporal Title:** Saint Thérèse of the Child Jesus, Virgin and Doctor of the Church
- **Season/Week:** `ORDINARY_TIME` / Week 26 / `YEAR_A` / `YEAR_2`
- **Celebration:** Saint Thérèse of the Child Jesus, Virgin and Doctor of the Church (`rank: MEMORIAL`, `color: WHITE`, `isOptional: false`)
- **Color:** `WHITE` | **Gloria:** `false` | **Creed:** `false`
- **ReadingSets:** 2 Alternative Sets
  - **Set 1 (Temporal Weekday):** `set-1001-weekday-458` (`context: WEEKDAY`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 458)
    - Job 19:21-27 | Psalm 27:7-8a, 8b-9abc, 13-14 (D-R Ps 26) | Luke 10:1-12
  - **Set 2 (Proper Memorial):** `set-1001-proper-649` (`context: PROPER_OF_SAINTS`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 649)
    - Isaiah 66:10-14c | Psalm 131:1, 2, 3 (D-R Ps 130) | Matthew 18:1-5

### 2026-10-02 (The Holy Guardian Angels)
- **Temporal Title:** The Holy Guardian Angels
- **Season/Week:** `ORDINARY_TIME` / Week 26 / `YEAR_A` / `YEAR_2`
- **Celebration:** The Holy Guardian Angels (`rank: MEMORIAL`, `color: WHITE`, `isOptional: false`)
- **Color:** `WHITE` | **Gloria:** `false` | **Creed:** `false`
- **ReadingSets:** 2 Alternative Sets
  - **Set 1 (Temporal Weekday):** `set-1002-weekday-459` (`context: WEEKDAY`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 459)
    - Job 38:1, 12-21; 40:3-5 | Psalm 139:1-3, 7-8, 9-10, 13-14ab (D-R Ps 138) | Luke 10:13-16
  - **Set 2 (Proper Memorial):** `set-1002-proper-650` (`context: PROPER_OF_SAINTS`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 650)
    - Exodus 23:20-23 | Psalm 91:1-2, 3-4, 5-6, 10-11 (D-R Ps 90) | Matthew 18:1-5, 10

### 2026-10-03 (Saturday, 26th Week in Ordinary Time)
- **Temporal Title:** Saturday of the Twenty-sixth Week in Ordinary Time
- **Season/Week:** `ORDINARY_TIME` / Week 26 / `YEAR_A` / `YEAR_2`
- **Observance:** Feria (`principalCelebration: null`, `secondaryCelebrations: []`)
- **Color:** `GREEN` | **Gloria:** `false` | **Creed:** `false`
- **Lectionary Number:** 460
- **ReadingSet:** `set-1003-weekday-460` (`context: WEEKDAY`, `selectionStatus: SOLE_SET`, `isCanonicalDefault: true`)
- **Citations:**
  - First Reading: Job 42:1-3, 5-6, 12-17 (`reading-1003-weekday-first-job42`)
  - Responsorial Psalm: Psalm 119:66, 71, 75, 91, 125, 128 (`scriptureRef: Psalm 118:66, 71, 75, 91, 125, 128`, `reading-1003-weekday-psalm-119`)
  - Gospel: Luke 10:17-24 (`reading-1003-weekday-gospel-luke10`)

### 2026-10-04 (Twenty-seventh Sunday in Ordinary Time)
- **Temporal Title:** Twenty-seventh Sunday in Ordinary Time
- **Season/Week:** `ORDINARY_TIME` / Week 27 / `YEAR_A` / `YEAR_2`
- **Displaced Observance:** St. Francis of Assisi (Displaced by Sunday precedence)
- **Celebration Row:** None created for Ordinary Sunday
- **Color:** `GREEN` | **Gloria:** `true` | **Creed:** `true`
- **Lectionary Number:** 139
- **ReadingSet:** `set-1004-sunday-139` (`context: SUNDAY`, `selectionStatus: SOLE_SET`, `isCanonicalDefault: true`)
- **Citations:**
  - First Reading: Isaiah 5:1-7 (`reading-1004-sunday-first-isaiah5`)
  - Responsorial Psalm: Psalm 80:9, 12, 13-14, 15-16, 19-20 (`scriptureRef: Psalm 79:9, 12, 13-14, 15-16, 19-20`, `reading-1004-sunday-psalm-80`)
  - Second Reading: Philippians 4:6-9 (`reading-1004-sunday-second-phil4`)
  - Gospel: Matthew 21:33-43 (`reading-1004-sunday-gospel-matt21`)

### 2026-10-05 (Monday, 27th Week / Saint Faustina Kowalska)
- **Temporal Title:** Monday of the Twenty-seventh Week in Ordinary Time
- **Season/Week:** `ORDINARY_TIME` / Week 27 / `YEAR_A` / `YEAR_2`
- **Celebration:** Saint Faustina Kowalska, Virgin (`rank: OPTIONAL_MEMORIAL`, `color: WHITE`, `isOptional: true`)
- **Principal Celebration:** `null`
- **Color:** `GREEN` | **Gloria:** `false` | **Creed:** `false`
- **ReadingSets:** 2 Alternative Sets
  - **Set 1 (Temporal Weekday):** `set-1005-weekday-461` (`context: WEEKDAY`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 461)
    - Galatians 1:6-12 | Psalm 111:1b-2, 7-8, 9 and 10c (D-R Ps 110) | Luke 10:25-37
  - **Set 2 (Proper St. Faustina):** `set-1005-proper-651b` (`context: PROPER_OF_SAINTS`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 651B)
    - Ephesians 3:14-19 | Psalm 103:1bc-2, 3-4, 8-9, 13-14, 17-18a (D-R Ps 102) | Matthew 11:25-30

### 2026-10-06 (Tuesday, 27th Week / Saint Bruno)
- **Temporal Title:** Tuesday of the Twenty-seventh Week in Ordinary Time
- **Season/Week:** `ORDINARY_TIME` / Week 27 / `YEAR_A` / `YEAR_2`
- **Celebration:** Saint Bruno, Priest (`rank: OPTIONAL_MEMORIAL`, `color: WHITE`, `isOptional: true`)
- **Principal Celebration:** `null`
- **Color:** `GREEN` | **Gloria:** `false` | **Creed:** `false`
- **ReadingSets:** 2 Alternative Sets
  - **Set 1 (Temporal Weekday):** `set-1006-weekday-462` (`context: WEEKDAY`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 462)
    - Galatians 1:13-24 | Psalm 139:1b-3, 13-14ab, 14c-15 (D-R Ps 138) | Luke 10:38-42
  - **Set 2 (Proper St. Bruno):** `set-1006-proper-652` (`context: PROPER_OF_SAINTS`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 652)
    - Philippians 3:8-14 | Psalm 1:1-2, 3, 4 and 6 (D-R Ps 1) | Luke 9:57-62

### 2026-10-07 (Our Lady of the Rosary)
- **Temporal Title:** Our Lady of the Rosary
- **Season/Week:** `ORDINARY_TIME` / Week 27 / `YEAR_A` / `YEAR_2`
- **Celebration:** Our Lady of the Rosary (`rank: MEMORIAL`, `color: WHITE`, `isOptional: false`)
- **Color:** `WHITE` | **Gloria:** `false` | **Creed:** `false`
- **ReadingSets:** 2 Alternative Sets
  - **Set 1 (Temporal Weekday):** `set-1007-weekday-463` (`context: WEEKDAY`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 463)
    - Galatians 2:1-2, 7-14 | Psalm 117:1, 2 (D-R Ps 116) | Luke 11:1-4
  - **Set 2 (Proper Rosary):** `set-1007-proper-653` (`context: PROPER_OF_SAINTS`, `selectionStatus: ALTERNATIVE`, `isCanonicalDefault: null`, Lectionary 653)
    - Acts 1:12-14 | Luke 1:46-55 (Magnificat) | Luke 1:26-38

### 2026-10-08 (Thursday, 27th Week in Ordinary Time)
- **Temporal Title:** Thursday of the Twenty-seventh Week in Ordinary Time
- **Season/Week:** `ORDINARY_TIME` / Week 27 / `YEAR_A` / `YEAR_2`
- **Observance:** Feria (`principalCelebration: null`, `secondaryCelebrations: []`)
- **Color:** `GREEN` | **Gloria:** `false` | **Creed:** `false`
- **Lectionary Number:** 464
- **ReadingSet:** `set-1008-weekday-464` (`context: WEEKDAY`, `selectionStatus: SOLE_SET`, `isCanonicalDefault: true`)
- **Citations:**
  - First Reading: Galatians 3:1-5 (`reading-1008-weekday-first-gal3`)
  - Responsorial Psalm: Luke 1:69-70, 71-72, 73-75 (`scriptureRef: Luke 1:69-75`, `reading-1008-weekday-psalm-luke1`)
  - Gospel: Luke 11:5-13 (`reading-1008-weekday-gospel-luke11`)

---

## 3. Package Summary Metrics (Programmatically Derived)

- **Liturgical Days:** 14
- **Celebrations:** 10 (5 `OPTIONAL_MEMORIAL`, 1 `FEAST`, 4 `MEMORIAL`)
- **ReadingSets:** 22 (11 `WEEKDAY`, 2 `SUNDAY`, 9 `PROPER_OF_SAINTS`)
- **Readings:** 68 (FIRST_READING: 22, RESPONSORIAL_PSALM: 22, SECOND_READING: 2, GOSPEL: 22)
- **Selection-Status Distribution:** `SOLE_SET: 6` | `ALTERNATIVE: 16` | `OPTIONAL: 0`
- **Psalm Chapter Mappings:** `1: 1`, `25: 24`, `27: 26`, `80: 79`, `88: 87`, `91: 90`, `103: 102`, `111: 110`, `117: 116`, `131: 130`, `138: 137`, `144: 143`
- **Sub-Verse Boundary Verification:** 100% `VERIFIED_EXACT` (Passages V–AH audited)
- **Omission / Deletion Delta:** `explicitlyDeletedSets: 0`, `explicitlyDeletedReadings: 0`, `omittedRetainedSets: 0`, `omittedRetainedReadings: 0`
- **Blockers & Warnings:** `0 Blockers, 0 Warnings`
- **Verdict:** **`READY_FOR_HUMAN_APPROVAL`**
