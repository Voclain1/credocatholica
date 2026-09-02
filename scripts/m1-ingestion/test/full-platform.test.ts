import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { prisma } from '../../../src/lib/prisma/index.js';
import { performGlobalSearch } from '../../../src/lib/search/service.js';
import sitemap from '../../../src/app/sitemap.js';

describe('Full Accelerated Platform Integration Suite', () => {
  it('1. Database has ingested Catechism entries across pillars', async () => {
    const count = await prisma.catechismEntry.count({ where: { publicationStatus: 'PUBLISHED' } });
    assert.ok(count >= 10, `Expected >= 10 Catechism entries, got ${count}`);

    const desireForGod = await prisma.catechismEntry.findUnique({
      where: { slug: 'the-desire-for-god-ccc-27-30' },
    });
    assert.notEqual(desireForGod, null);
    assert.equal(desireForGod?.paragraphStart, 27);
    assert.equal(desireForGod?.paragraphEnd, 30);
  });

  it('2. Database has ingested Church Documents', async () => {
    const count = await prisma.churchDocument.count({ where: { publicationStatus: 'PUBLISHED' } });
    assert.ok(count >= 5, `Expected >= 5 Church Documents, got ${count}`);

    const lumenGentium = await prisma.churchDocument.findUnique({
      where: { slug: 'lumen-gentium' },
    });
    assert.notEqual(lumenGentium, null);
    assert.equal(lumenGentium?.documentType, 'COUNCIL_CONSTITUTION');
    assert.ok(lumenGentium?.issuingAuthority.includes('Vatican'), 'Expected issuing authority to include Vatican');
  });

  it('3. Database has ingested Formation Pathways, Modules, and Lessons', async () => {
    const pathwayCount = await prisma.formationPathway.count({ where: { publicationStatus: 'PUBLISHED' } });
    assert.ok(pathwayCount >= 3, `Expected >= 3 Formation Pathways, got ${pathwayCount}`);

    const introPathway = await prisma.formationPathway.findUnique({
      where: { slug: 'introduction-to-catholic-theology' },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });
    assert.notEqual(introPathway, null);
    assert.ok((introPathway?.modules.length ?? 0) >= 2);
    assert.ok((introPathway?.modules[0].lessons.length ?? 0) >= 3);
  });

  it('4. Universal Search Service returns multi-domain results', async () => {
    const searchResults = await performGlobalSearch('God');
    assert.ok(searchResults.length > 0, 'Expected search results for "God"');

    const searchTypes = new Set(searchResults.map((r) => r.type));
    assert.ok(searchTypes.size >= 2, `Expected multi-domain search results, got types: ${Array.from(searchTypes).join(', ')}`);
  });

  it('5. Dynamic Sitemap Generator builds clean routes for all domain items', async () => {
    const sitemapEntries = await sitemap();
    assert.ok(sitemapEntries.length >= 50, `Expected >= 50 sitemap entries, got ${sitemapEntries.length}`);

    const urls = sitemapEntries.map((e) => e.url);
    assert.ok(urls.includes('https://credocatholica.com/today'));
    assert.ok(urls.includes('https://credocatholica.com/saints'));
    assert.ok(urls.includes('https://credocatholica.com/prayers'));
    assert.ok(urls.includes('https://credocatholica.com/novenas'));
    assert.ok(urls.includes('https://credocatholica.com/catechism'));
    assert.ok(urls.includes('https://credocatholica.com/church-documents'));
    assert.ok(urls.includes('https://credocatholica.com/learn'));
    assert.ok(urls.includes('https://credocatholica.com/search'));
  });
});
