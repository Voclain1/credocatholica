import { loadSourcePackage, loadExclusions } from './src/loader.js';
import { validateSourcePackage } from './src/validate.js';
import { transformClassifications } from './src/transform/classifications.js';
import { transformSaint } from './src/transform/saints.js';
import { transformPrayer } from './src/transform/prayers.js';
import { transformNovena } from './src/transform/novenas.js';
import { transformCatechismEntry } from './src/transform/catechism.js';
import { transformChurchDocument } from './src/transform/documents.js';
import { transformReflection } from './src/transform/reflections.js';
import { transformReading } from './src/transform/readings.js';
import { transformFormationPathway } from './src/transform/formation.js';
import { generateReconciliationReport } from './src/reconciliation.js';
import { ReconciliationMetrics, ValidationIssue, PrayerTypeTermAudit, MigrationVerdict } from './src/types.js';
import { PRAYER_TYPE_MAP } from './src/normalize.js';

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  const isFixtures = args.includes('--fixtures');
  const isDryRun = !isApply || args.includes('--dry-run');

  console.log(`================================================================`);
  console.log(`CredoCatholica WordPress Migration Pipeline Tooling`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Database Independent)' : 'APPLY (Database Execution)'}`);
  console.log(`Source: ${isFixtures ? 'Synthetic Fixtures' : 'Real Input Package'}`);
  console.log(`================================================================\n`);

  // 1. LOAD SOURCE PACKAGE & EXCLUSIONS CONFIG
  const pkg = loadSourcePackage(isFixtures);
  const exclusions = isFixtures ? [] : loadExclusions();

  console.log(`[pipeline] Loaded source package cleanly:`);
  console.log(`  - Posts Loaded:        ${pkg.posts.length}`);
  console.log(`  - PostMeta Loaded:     ${pkg.postmeta.length}`);
  console.log(`  - Terms Loaded:        ${pkg.terms.length}`);
  console.log(`  - TermTaxonomies:      ${pkg.termTaxonomy.length}`);
  console.log(`  - TermRelationships:   ${pkg.termRelationships.length}`);
  console.log(`  - Media Items:         ${pkg.media.length}`);
  console.log(`  - Exclusions Rules:    ${exclusions.length}`);

  const issues: ValidationIssue[] = [];
  const excludedPostIds = new Set<number>();
  let orphanedRelCount = 0;

  // Build exclusion lookup map: key = `${sourceSystem}:${legacyObjectType}:${legacyObjectId}`
  const exclusionMap = new Map<string, string>();
  for (const rule of exclusions) {
    const key = `${rule.sourceSystem.toLowerCase()}:${rule.legacyObjectType.toLowerCase()}:${rule.legacyObjectId}`;
    exclusionMap.set(key, rule.reason);
  }

  // Filter posts against exclusion rules
  const activePosts = [];
  for (const post of pkg.posts) {
    const key = `wordpress:${post.post_type.toLowerCase()}:${post.ID}`;
    const exclusionReason = exclusionMap.get(key);

    if (exclusionReason) {
      excludedPostIds.add(post.ID);
      issues.push({
        legacyId: post.ID,
        postType: post.post_type,
        field: 'ID',
        message: `EXCLUDED_BY_REVIEW: Post '${post.post_title}' (ID: ${post.ID}, Type: ${post.post_type}) excluded by human editorial review (Reason: ${exclusionReason}).`,
        severity: 'INFO',
        category: 'EXCLUDED_BY_REVIEW',
      });
    } else {
      activePosts.push(post);
    }
  }

  // Check for orphaned relationships from excluded posts
  for (const rel of pkg.termRelationships) {
    if (excludedPostIds.has(rel.object_id)) {
      orphanedRelCount++;
      issues.push({
        legacyId: rel.object_id,
        postType: 'term_relationship',
        field: 'object_id',
        message: `ORPHANED_RELATIONSHIP: Term relationship for object_id ${rel.object_id} orphaned due to post exclusion by editorial review.`,
        severity: 'INFO',
        category: 'ORPHANED_RELATIONSHIP',
      });
    }
  }

  // 2. DOMAIN TRANSFORMATIONS (Active Posts Only)
  // Phase 1: Classifications / Lookups (Independent of active post count)
  const classifications = transformClassifications(pkg, issues);

  // Phase 2 & 3: Primary Entities & Owned Children
  const transformedSaints = [];
  const transformedPrayers = [];
  const transformedNovenas = [];
  const transformedCatechismEntries = [];
  const transformedChurchDocuments = [];
  const transformedReflections = [];
  const transformedReadings = [];
  const transformedFormationPathways = [];

  for (const post of activePosts) {
    switch (post.post_type) {
      case 'cc_saint':
        transformedSaints.push(transformSaint(post, issues));
        break;
      case 'cc_prayer':
        transformedPrayers.push(transformPrayer(post, issues));
        break;
      case 'cc_novena':
        transformedNovenas.push(transformNovena(post, issues));
        break;
      case 'cc_catechism':
        transformedCatechismEntries.push(transformCatechismEntry(post, issues));
        break;
      case 'cc_document':
        transformedChurchDocuments.push(transformChurchDocument(post, issues));
        break;
      case 'cc_reflection':
        transformedReflections.push(transformReflection(post, issues));
        break;
      case 'cc_reading':
        transformedReadings.push(transformReading(post, issues));
        break;
      case 'cc_formation':
        transformedFormationPathways.push(transformFormationPathway(post, issues));
        break;
    }
  }

  // 3. SOURCE SCHEMA & IDENTITY COLLISION VALIDATION
  const validationIssues = validateSourcePackage({ ...pkg, posts: activePosts }, transformedReadings);
  issues.push(...validationIssues);

  // Post count by CPT
  const byPostType: Record<string, number> = {};
  for (const post of pkg.posts) {
    byPostType[post.post_type] = (byPostType[post.post_type] || 0) + 1;
  }

  // 4. CLASSIFICATIONS TAXONOMIES AUDIT (Post-Exclusion active relationships)
  const termRelationshipsByTtId = new Map<number, number>();
  for (const rel of pkg.termRelationships) {
    if (!excludedPostIds.has(rel.object_id)) {
      termRelationshipsByTtId.set(rel.term_taxonomy_id, (termRelationshipsByTtId.get(rel.term_taxonomy_id) || 0) + 1);
    }
  }

  let patronageReferenced = 0;
  let vocationReferenced = 0;
  let seasonReferenced = 0;

  for (const tt of pkg.termTaxonomy) {
    const count = termRelationshipsByTtId.get(tt.term_taxonomy_id) || 0;
    if (tt.taxonomy === 'cc_patronage' && count > 0) patronageReferenced++;
    if (tt.taxonomy === 'cc_vocation' && count > 0) vocationReferenced++;
    if (tt.taxonomy === 'cc_liturgical_season' && count > 0) seasonReferenced++;
  }

  // 5. PRAYER TYPE TAXONOMY TERMS AUDIT
  const termMap = new Map<number, { name: string; slug: string }>();
  for (const t of pkg.terms) {
    termMap.set(t.term_id, { name: t.name, slug: t.slug });
  }

  const prayerTypeAudit: PrayerTypeTermAudit[] = [];
  for (const tt of pkg.termTaxonomy) {
    if (tt.taxonomy === 'cc_prayer_type') {
      const term = termMap.get(tt.term_id);
      if (!term) continue;
      const count = termRelationshipsByTtId.get(tt.term_taxonomy_id) || 0;
      const mapped = PRAYER_TYPE_MAP[term.slug.toLowerCase()] || PRAYER_TYPE_MAP[term.name.toLowerCase()];

      prayerTypeAudit.push({
        termId: tt.term_id,
        name: term.name,
        slug: term.slug,
        relationshipCount: count,
        mappedType: mapped ? String(mapped) : undefined,
        status: mapped ? 'MAPPED' : 'REQUIRES_REVIEW',
      });
    }
  }

  // 6. COMPUTING RECONCILIATION METRICS
  const excludedByReview = excludedPostIds.size;
  const canonicalContentRecordsFromPosts =
    transformedSaints.length +
    transformedPrayers.length +
    transformedNovenas.length +
    transformedCatechismEntries.length +
    transformedChurchDocuments.length +
    transformedReflections.length +
    transformedReadings.length +
    transformedFormationPathways.length;

  const warnings = issues.filter((i) => i.severity === 'WARNING').length;
  const failures = issues.filter((i) => i.severity === 'ERROR').length;
  const requiresReview = issues.filter((i) => i.severity === 'REQUIRES_REVIEW').length;
  const deferred = issues.filter((i) => i.category === 'DEFERRED_FIELD').length;
  const unresolvedRel = issues.filter((i) => i.category === 'UNRESOLVED_RELATIONSHIP').length;
  const unknownEnums = issues.filter((i) => i.category === 'UNKNOWN_ENUM').length;
  const duplicateSlugs = issues.filter((i) => i.category === 'DUPLICATE_SLUG').length;
  const sanitizedFields = issues.filter((i) => i.category === 'UNSAFE_HTML').length;
  const liturgicalDayCollisions = issues.filter((i) => i.category === 'LITURGICAL_DAY_COLLISION').length;
  const missingReadingTexts = issues.filter((i) => i.category === 'MISSING_READING_TEXT').length;
  const sourceContentReviews = issues.filter((i) => i.category === 'SOURCE_CONTENT_REVIEW').length;

  // Calculate Canonical Ready count
  let canonicalReadyCount = 0;
  for (const r of transformedReadings) if (r.isValidForCanonicalApply && !issues.some(i => i.legacyId === r.legacyId && i.severity === 'REQUIRES_REVIEW')) canonicalReadyCount++;
  for (const s of transformedSaints) if (s.isValidForCanonicalApply && !issues.some(i => i.legacyId === s.legacyId && i.severity === 'REQUIRES_REVIEW')) canonicalReadyCount++;
  for (const p of transformedPrayers) if (!issues.some(i => i.legacyId === p.legacyId && i.severity === 'REQUIRES_REVIEW')) canonicalReadyCount++;
  for (const n of transformedNovenas) canonicalReadyCount++;
  for (const c of transformedCatechismEntries) canonicalReadyCount++;
  for (const d of transformedChurchDocuments) canonicalReadyCount++;
  for (const rf of transformedReflections) canonicalReadyCount++;
  for (const f of transformedFormationPathways) canonicalReadyCount++;

  const verdict: MigrationVerdict =
    excludedByReview === pkg.posts.length && pkg.posts.length > 0
      ? 'NO_CANONICAL_POSTS_TO_IMPORT'
      : requiresReview > 0 || failures > 0 || liturgicalDayCollisions > 0
      ? 'NOT_SAFE_TO_APPLY'
      : warnings > 0
      ? 'APPLY_AFTER_REVIEW'
      : 'SAFE_TO_APPLY';

  const metrics: ReconciliationMetrics = {
    verdict,
    source: {
      posts: pkg.posts.length,
      postmeta: pkg.postmeta.length,
      terms: pkg.terms.length,
      termTaxonomy: pkg.termTaxonomy.length,
      termRelationships: pkg.termRelationships.length,
      media: pkg.media.length,
      byPostType,
    },
    planned: {
      wouldInsert:
        classifications.patronages.length +
        classifications.vocations.length +
        classifications.seasons.length +
        canonicalContentRecordsFromPosts,
      wouldUpdate: 0,
      wouldSkip: 0,
      canonicalContentRecordsFromPosts,
      byEntityType: {
        Patronage: { wouldInsert: classifications.patronages.length, wouldUpdate: 0, wouldSkip: 0 },
        Vocation: { wouldInsert: classifications.vocations.length, wouldUpdate: 0, wouldSkip: 0 },
        LiturgicalSeason: { wouldInsert: classifications.seasons.length, wouldUpdate: 0, wouldSkip: 0 },
        Saint: { wouldInsert: transformedSaints.length, wouldUpdate: 0, wouldSkip: 0 },
        Prayer: { wouldInsert: transformedPrayers.length, wouldUpdate: 0, wouldSkip: 0 },
        Novena: { wouldInsert: transformedNovenas.length, wouldUpdate: 0, wouldSkip: 0 },
        CatechismEntry: { wouldInsert: transformedCatechismEntries.length, wouldUpdate: 0, wouldSkip: 0 },
        ChurchDocument: { wouldInsert: transformedChurchDocuments.length, wouldUpdate: 0, wouldSkip: 0 },
        Reflection: { wouldInsert: transformedReflections.length, wouldUpdate: 0, wouldSkip: 0 },
        LiturgicalDayPackage: { wouldInsert: transformedReadings.length, wouldUpdate: 0, wouldSkip: 0 },
        FormationPathway: { wouldInsert: transformedFormationPathways.length, wouldUpdate: 0, wouldSkip: 0 },
      },
    },
    quality: {
      sourceStructurallyValid: pkg.posts.length,
      canonicalReady: canonicalReadyCount,
      excludedByReview,
      requiresReview,
      failures,
      deferred,
      unresolvedRelationships: unresolvedRel,
      orphanedRelationships: orphanedRelCount,
      unknownEnums,
      duplicateSlugs,
      sanitizedFields,
      liturgicalDayCollisions,
      missingReadingTexts,
      sourceContentReviews,
    },
    classificationsAudit: {
      patronages: { totalDefined: classifications.patronages.length, referenced: patronageReferenced },
      vocations: { totalDefined: classifications.vocations.length, referenced: vocationReferenced },
      seasons: { totalDefined: classifications.seasons.length, referenced: seasonReferenced },
    },
    prayerTypeAudit,
    issues,
  };

  // 7. GENERATE RECONCILIATION REPORT
  generateReconciliationReport(metrics, isDryRun);

  // 8. DYNAMIC IMPORT FOR APPLY MODE ONLY
  if (isApply && !isDryRun) {
    if (verdict === 'NOT_SAFE_TO_APPLY' || verdict === 'NO_CANONICAL_POSTS_TO_IMPORT') {
      console.error(`\n[pipeline] ABORTING APPLY: Verdict is ${verdict}.`);
      process.exit(1);
    }
    console.log(`\n[pipeline] Dynamic loading importer module for database execution...`);
    const { executeTransactionalImport } = await import('./src/import/importer.js');
    await executeTransactionalImport({ classifications });
  } else {
    console.log(`\n[pipeline] Dry-run complete. Database write skipped.`);
  }
}

main().catch((err) => {
  console.error(`[pipeline] Execution failed: ${err.message}`);
  process.exit(1);
});
