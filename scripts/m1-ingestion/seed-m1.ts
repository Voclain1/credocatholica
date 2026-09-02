import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { applyM1Ingestion } from './src/m1-applier.js';
import { applyReferenceIngestion } from './src/reference-applier.js';

async function main() {
  console.log('=== RUNNING M1 INGESTION ENGINE ===\n');

  const result = await applyM1Ingestion();

  if (!result.applied) {
    console.error('M1 Ingestion FAILED validation!');
    console.error(JSON.stringify(result.validation.blockers, null, 2));
    process.exit(1);
  }

  console.log('M1 Ingestion SUCCESSFUL!');
  console.log(`- Saints:            +${result.insertedSaints} inserted, ${result.updatedSaints} updated`);
  console.log(`- Patronages:        +${result.insertedPatronages} inserted, ${result.updatedPatronages} updated`);
  console.log(`- Vocations:         +${result.insertedVocations} inserted, ${result.updatedVocations} updated`);
  console.log(`- Prayers:           +${result.insertedPrayers} inserted, ${result.updatedPrayers} updated`);
  console.log(`- Novenas:           +${result.insertedNovenas} inserted, ${result.updatedNovenas} updated`);
  console.log(`- NovenaDays:        +${result.insertedNovenaDays} inserted, ${result.updatedNovenaDays} updated`);
  console.log(`- Linked Celebrations: ${result.linkedCelebrations}`);
  console.log(`- Linked SaintPrayers: ${result.linkedSaintPrayers}`);
  console.log(`- Linked SaintNovenas: ${result.linkedSaintNovenas}`);
  console.log(`- Linked SaintPatronages: ${result.linkedSaintPatronages}`);
  console.log(`- Linked SaintVocations: ${result.linkedSaintVocations}`);

  console.log('\n=== INGESTING CATECHISM, CHURCH DOCUMENTS & FORMATION ===\n');
  await applyReferenceIngestion();
  console.log('\nALL PLATFORM DOMAINS SEEDED SUCCESSFULLY!');
}

main()
  .catch((err) => {
    console.error('Fatal error during seed:', err);
    process.exit(1);
  });
