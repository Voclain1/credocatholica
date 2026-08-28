# CredoCatholica — Engineering Agent Instructions

## 1. Project

CredoCatholica is a global Catholic digital platform comprising:

1. Daily Liturgical Companion
2. Permanent Catholic Reference Library
3. Structured Formation Pathways

This repository is the Next.js successor to an existing WordPress implementation.

The WordPress application is a source for:
- existing content structure;
- field definitions;
- URLs;
- content;
- business rules;
- design decisions.

It is NOT the architecture that must be reproduced verbatim.

---

## 2. Core Engineering Principle

Build CredoCatholica as a structured application, not as a generic blog CMS.

Prefer:

- explicit domain models;
- relational data;
- reusable services;
- typed interfaces;
- deterministic behaviour;
- testable business logic.

Avoid:

- generic Post models for unrelated domains;
- excessive JSON blobs;
- duplicated business logic;
- Prisma/database calls scattered through UI components;
- hard-coded liturgical calculations inside React components.

---

## 3. Approved Stack

Unless explicitly approved otherwise, use:

- Next.js
- TypeScript
- App Router
- React Server Components where appropriate
- PostgreSQL
- Prisma ORM
- Vercel
- pnpm
- ESLint
- Prettier

Do NOT replace PostgreSQL with:

- Firebase Firestore
- MongoDB
- SQLite in production
- Supabase document-style abstractions
- another datastore

without explicit approval.

A managed PostgreSQL service such as Neon may be used.

---

## 4. Repository Architecture

Prefer a structure similar to:

app/
components/
lib/
prisma/
scripts/
docs/
public/

Domain logic should live outside page components.

Prefer:

lib/liturgy/
lib/saints/
lib/prayers/
lib/novenas/
lib/catechism/
lib/formation/
lib/search/
lib/seo/
lib/validation/

Do not create unnecessary abstraction layers.

---

## 5. Primary Domain Model

CredoCatholica currently contains these legacy WordPress CPTs:

- cc_reading
- cc_saint
- cc_prayer
- cc_novena
- cc_catechism
- cc_season
- cc_reflection
- cc_document
- cc_formation

Do not automatically reproduce them as nine generic post tables.

The new architecture should distinguish between:

### Liturgical domain

- LiturgicalDay
- Celebration
- LiturgicalSeason
- Reading

### Reference/content domain

- Saint
- Prayer
- Novena
- CatechismEntry
- ChurchDocument
- Reflection

### Formation domain

- FormationPathway
- FormationModule or equivalent structured entity

### Classification domain

- Patronage
- Vocation
- PrayerType
- CatechismPillar
- other reusable classification entities where justified

Relationships must be represented relationally when the relationship has semantic meaning.

---

## 6. Liturgical Architecture

A Saint is not the same thing as a liturgical Celebration.

A Reading is not the same thing as a LiturgicalDay.

Do not collapse these concepts.

The long-term model must be capable of supporting:

- fixed celebrations;
- movable celebrations;
- liturgical ranks;
- liturgical colours;
- liturgical seasons;
- temporal cycles;
- Sunday cycles;
- weekday cycles;
- precedence;
- transferred celebrations;
- optional memorials;
- universal and regional calendars.

Not all of this must be implemented immediately.

However, schema decisions must not prevent it later.

---

## 7. Existing Reading Structure

Legacy WordPress reading records contain data including:

- liturgical_date
- year_cycle
- weekday_cycle
- feast_name
- liturgical_colour
- first_reading_ref
- first_reading_text
- psalm_ref
- psalm_response
- psalm_text
- second_reading_ref
- second_reading_text
- gospel_ref
- gospel_text
- gloria_required
- creed_required
- linked_saint

During migration, preserve this information.

The canonical architecture should allow multiple Reading records to belong to a LiturgicalDay instead of requiring all reading texts to remain columns on one record.

---

## 8. Existing Saint Structure

Legacy Saint fields include concepts such as:

- feast date
- death year
- canonization status
- Doctor of the Church
- martyr status
- religious order affiliation
- historical confidence
- region-specific status
- saint image
- relic image
- associated prayers
- associated novenas

Preserve semantic information during migration.

Do not silently discard legacy fields.

---

## 9. Editorial Governance

CredoCatholica has unusually strict content-governance requirements.

The system must eventually support structured review information rather than only publication status.

Potential states may include:

- DRAFT
- SOURCE_VERIFICATION
- DOCTRINAL_REVIEW
- EDITORIAL_REVIEW
- APPROVED
- PUBLISHED

Do not implement a workflow until its schema/design is approved.

However, architecture must allow review history and source verification to be added without major redesign.

---

## 10. Catholic Content Integrity

Content accuracy is safety-critical for this project.

The engineering agent must NEVER autonomously:

- rewrite canonical Catholic prayers;
- paraphrase Scripture stored as canonical reading text;
- invent Church documents;
- fabricate saint information;
- invent quotations;
- alter Rosary mysteries or structure;
- infer Catechism paragraph references;
- create fictional apparitions, revelations, indulgences, feast days, titles, patronages, or doctrinal claims.

The selected Bible translation is the public-domain Douay-Rheims Bible.

Canonical texts must be preserved exactly as supplied or sourced through an approved pipeline.

Accuracy > speed.
Fidelity > creativity.
Clarity > engagement.

Human doctrinal review remains authoritative.

---

## 11. Source Provenance

Where practical, structured religious content should be able to retain:

- source;
- source type;
- citation/reference;
- verification status;
- reviewer;
- verification date.

Do not assume generated content is authoritative merely because it exists in the database.

---

## 12. URLs and SEO

Existing public URLs should be preserved wherever practical.

Important URL families include:

- /readings/
- /saints/
- /prayers/
- /novenas/
- /catechism/
- /church-documents/
- /formation/

Do not rename existing URL structures without explicit approval.

The migration must eventually support redirects for any URLs that cannot be retained.

SEO requirements include:

- canonical URLs;
- metadata;
- structured data where appropriate;
- sitemap generation;
- robots configuration;
- Open Graph metadata;
- strong internal linking.

Do not mass-generate low-value SEO pages.

---

## 13. Design System

Existing CredoCatholica visual identity:

- Deep Blue: #1a2744
- Sacred Cream: #f5f0e8
- Burgundy: #6b1f2a
- Muted Gold: #9a7c3f

Typography direction:

- Crimson Pro or Cormorant Garamond for headings
- Inter for body text

Design philosophy:

- sacred minimalism;
- liturgical dignity;
- generous whitespace;
- restrained decoration;
- high readability;
- reverent visual hierarchy.

Avoid:

- SaaS/startup aesthetics;
- excessive gradients;
- flashy animation;
- giant marketing banners;
- glassmorphism;
- gamification aesthetics;
- cluttered news/blog grids;
- clickbait styling.

---

## 14. WordPress Migration

The legacy WordPress installation uses:

- Astra
- custom child theme
- ACF Pro
- custom CPT registrations
- custom taxonomies
- PHP-defined ACF fields
- WP All Import
- CSV-based readings import

WordPress code is migration input, not production code for the Next.js application.

Do not copy PHP architecture literally.

Migration tooling belongs under:

scripts/wordpress-migration/

Migration must be:

- repeatable;
- idempotent where practical;
- logged;
- validated;
- safe to rerun during development.

Never delete the source WordPress data automatically.

---

## 15. Database Changes & Migration Policy

Do not modify the canonical Prisma schema casually.

For every significant schema change:

1. explain why it is needed;
2. identify affected models;
3. identify migration implications;
4. update documentation;
5. add a Prisma migration;
6. validate existing data implications.

Never use `prisma db push` as a substitute for proper production migrations once the canonical schema is established.

Schema prototyping may use appropriate local development workflows before a migration exists, but once a canonical migration file is created, persistent project database changes must be tracked through Prisma migration history.

For this project:
- committed schema evolution -> Prisma migrations;
- `prisma db push` must not replace migration application on shared Neon development;
- database migration history (`_prisma_migrations`) must remain in sync with committed migration files (`prisma/migrations`).

---

## 16. Code Quality

All code must be:

- TypeScript-first;
- production-oriented;
- strongly typed;
- readable;
- testable;
- minimally dependent on third-party packages.

Avoid `any` unless unavoidable and documented.

Avoid TODO placeholders in completed tasks.

Avoid dead code.

Avoid duplicated utilities.

Do not introduce packages when built-in Next.js, React, Node, Prisma or standard browser capabilities are sufficient.

---

## 17. Security

Never commit:

- secrets;
- API keys;
- database passwords;
- WordPress credentials;
- private tokens.

Use environment variables.

Validate all admin input.

Treat imported WordPress HTML as untrusted until sanitized appropriately.

Do not expose unpublished religious/editorial content through public API endpoints.

---

## 18. Implementation Discipline

Work in explicitly approved phases.

Do not jump ahead.

Before a major implementation:

1. inspect existing repository state;
2. identify relevant existing code;
3. state assumptions;
4. implement only the requested scope;
5. run validation;
6. report exactly what changed.

Do not redesign unrelated systems while completing a scoped task.

---

## 19. Testing

Important application logic must have tests.

Prioritize tests for:

- liturgical calculations;
- date handling;
- import transformations;
- slug generation;
- relationship mapping;
- publication filtering;
- content sanitization;
- redirects.

A successful TypeScript build alone is not sufficient validation.

---

## 20. Agent Authority

The engineering agent may:

- implement approved tasks;
- refactor locally when required;
- fix discovered bugs that directly block approved work;
- propose architectural improvements.

The engineering agent may NOT independently:

- change the production stack;
- redefine project scope;
- change theological/content policy;
- remove existing fields;
- change canonical URLs;
- introduce a new CMS;
- change database technology;
- begin future phases;
- perform destructive migrations.

When uncertain, document the issue and stop before making an irreversible architectural decision.