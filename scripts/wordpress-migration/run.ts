import { loadSourcePackage } from './src/loader.js';
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
import { ReconciliationMetrics, ValidationIssue } from './src/types.js';

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

  // 1. LOAD SOURCE PACKAGE
  const pkg = loadSourcePackage(isFixtures);
  console.log(`[pipeline] Loaded source package cleanly:`);
  console.log(`  - Posts:               ${pkg.posts.length}`);
  console.log(`  - PostMeta:            ${pkg.postmeta.length}`);
  console.log(`  - Terms:               ${pkg.terms.length}`);
  console.log(`  - TermTaxonomies:      ${pkg.termTaxonomy.length}`);
  console.log(`  - TermRelationships:   ${pkg.termRelationships.length}`);
  console.log(`  - Media Items:         ${pkg.media.length}`);

  // 2. SOURCE SCHEMA VALIDATION
  const issues: ValidationIssue[] = validateSourcePackage(pkg);

  // Track post counts by CPT
  const byPostType: Record<string, number> = {};
  for (const post of pkg.posts) {
    byPostType[post.post_type] = (byPostType[post.post_type] || 0) + 1;
  }

  // 3. DOMAIN TRANSFORMATIONS (Dependency Order)
  // Phase 1: Classifications / Lookups
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

  for (const post of pkg.posts) {
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

  // 4. COMPUTING RECONCILIATION METRICS
  const warnings = issues.filter((i) => i.severity === 'WARNING').length;
  const failures = issues.filter((i) => i.severity === 'ERROR').length;
  const deferred = issues.filter((i) => i.category === 'DEFERRED_FIELD').length;
  const unresolvedRel = issues.filter((i) => i.category === 'UNRESOLVED_RELATIONSHIP').length;
  const unknownEnums = issues.filter((i) => i.category === 'UNKNOWN_ENUM').length;
  const duplicateSlugs = issues.filter((i) => i.category === 'DUPLICATE_SLUG').length;
  const sanitizedFields = issues.filter((i) => i.category === 'UNSAFE_HTML').length;

  const metrics: ReconciliationMetrics = {
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
        transformedSaints.length +
        transformedPrayers.length +
        transformedNovenas.length +
        transformedCatechismEntries.length +
        transformedChurchDocuments.length +
        transformedReflections.length +
        transformedReadings.length +
        transformedFormationPathways.length,
      wouldUpdate: 0,
      wouldSkip: 0,
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
      valid: pkg.posts.length - failures,
      warnings,
      failures,
      deferred,
      unresolvedRelationships: unresolvedRel,
      unknownEnums,
      duplicateSlugs,
      sanitizedFields,
    },
    issues,
  };

  // 5. GENERATE RECONCILIATION REPORT
  generateReconciliationReport(metrics, isDryRun);

  // 6. DYNAMIC IMPORT FOR APPLY MODE ONLY (Rule 5 & 12)
  if (isApply && !isDryRun) {
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
