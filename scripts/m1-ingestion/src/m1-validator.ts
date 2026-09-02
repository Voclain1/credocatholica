import { M1_SAINTS, M1SaintRecord } from './saints-data.js';
import { M1_PRAYERS, M1PrayerRecord } from './prayers-data.js';
import { M1_NOVENAS, M1NovenaRecord } from './novenas-data.js';

export interface M1ValidationIssue {
  code:
    | 'SAINT_SLUG_COLLISION'
    | 'PRAYER_SLUG_COLLISION'
    | 'NOVENA_SLUG_COLLISION'
    | 'NOVENA_DAY_GAP'
    | 'NOVENA_DAY_DUPLICATE'
    | 'BROKEN_SAINT_PRAYER_ASSOCIATION'
    | 'BROKEN_SAINT_NOVENA_ASSOCIATION'
    | 'UNSOURCED_PRAYER'
    | 'UNSOURCED_NOVENA'
    | 'UNSOURCED_SAINT_BIOGRAPHY'
    | 'MISSING_RIGHTS_STATUS';
  message: string;
  context?: Record<string, any>;
}

export interface M1ValidationReport {
  isValid: boolean;
  blockers: M1ValidationIssue[];
  warnings: M1ValidationIssue[];
  summary: {
    totalSaints: number;
    totalPrayers: number;
    totalNovenas: number;
    totalNovenaDays: number;
    publicDomainCount: number;
    requiresRightsReviewCount: number;
    originalEditorialCount: number;
  };
}

export type M1ValidationResult = M1ValidationReport;

export function validateM1Dataset(
  saints: M1SaintRecord[] = M1_SAINTS,
  prayers: M1PrayerRecord[] = M1_PRAYERS,
  novenas: M1NovenaRecord[] = M1_NOVENAS
): M1ValidationReport {
  const blockers: M1ValidationIssue[] = [];
  const warnings: M1ValidationIssue[] = [];

  const saintSlugs = new Set<string>();
  const prayerSlugs = new Set<string>();
  const novenaSlugs = new Set<string>();

  let publicDomainCount = 0;
  let requiresRightsReviewCount = 0;
  let originalEditorialCount = 0;

  // 1. Validate Saints
  for (const s of saints) {
    if (saintSlugs.has(s.slug)) {
      blockers.push({
        code: 'SAINT_SLUG_COLLISION',
        message: `Duplicate Saint slug found: "${s.slug}"`,
        context: { slug: s.slug },
      });
    }
    saintSlugs.add(s.slug);

    if (!s.rightsStatus) {
      blockers.push({
        code: 'MISSING_RIGHTS_STATUS',
        message: `Saint "${s.slug}" is missing explicit rightsStatus.`,
        context: { slug: s.slug },
      });
    }

    if (!s.biography || s.biography.trim().length < 20) {
      blockers.push({
        code: 'UNSOURCED_SAINT_BIOGRAPHY',
        message: `Saint "${s.slug}" has empty or insufficient biography text.`,
        context: { slug: s.slug },
      });
    }

    if (!s.exactSource || !s.sourceOrganization) {
      blockers.push({
        code: 'UNSOURCED_SAINT_BIOGRAPHY',
        message: `Saint "${s.slug}" lacks explicit primary factual source / organization attribution.`,
        context: { slug: s.slug },
      });
    }

    if (s.rightsStatus === 'PUBLIC_DOMAIN_CONFIRMED') publicDomainCount++;
    if (s.rightsStatus === 'REQUIRES_RIGHTS_REVIEW') requiresRightsReviewCount++;
    if (s.rightsStatus === 'ORIGINAL_EDITORIAL_TEXT') originalEditorialCount++;
  }

  // 2. Validate Prayers
  for (const p of prayers) {
    if (prayerSlugs.has(p.slug)) {
      blockers.push({
        code: 'PRAYER_SLUG_COLLISION',
        message: `Duplicate Prayer slug found: "${p.slug}"`,
        context: { slug: p.slug },
      });
    }
    prayerSlugs.add(p.slug);

    if (!p.rightsStatus) {
      blockers.push({
        code: 'MISSING_RIGHTS_STATUS',
        message: `Prayer "${p.slug}" is missing explicit rightsStatus.`,
        context: { slug: p.slug },
      });
    }

    if (!p.exactSource || !p.sourceOrganization) {
      blockers.push({
        code: 'UNSOURCED_PRAYER',
        message: `Prayer "${p.slug}" lacks explicit machine-readable source or organization metadata.`,
        context: { slug: p.slug },
      });
    }

    // Check broken saint associations
    if (p.saintSlugs) {
      for (const stSlug of p.saintSlugs) {
        if (!saintSlugs.has(stSlug)) {
          blockers.push({
            code: 'BROKEN_SAINT_PRAYER_ASSOCIATION',
            message: `Prayer "${p.slug}" references non-existent Saint slug "${stSlug}"`,
            context: { prayerSlug: p.slug, saintSlug: stSlug },
          });
        }
      }
    }

    if (p.rightsStatus === 'PUBLIC_DOMAIN_CONFIRMED') publicDomainCount++;
    if (p.rightsStatus === 'REQUIRES_RIGHTS_REVIEW') requiresRightsReviewCount++;
    if (p.rightsStatus === 'ORIGINAL_EDITORIAL_TEXT') originalEditorialCount++;
  }

  // 3. Validate Novenas
  let totalNovenaDays = 0;
  for (const n of novenas) {
    if (novenaSlugs.has(n.slug)) {
      blockers.push({
        code: 'NOVENA_SLUG_COLLISION',
        message: `Duplicate Novena slug found: "${n.slug}"`,
        context: { slug: n.slug },
      });
    }
    novenaSlugs.add(n.slug);

    if (!n.rightsStatus) {
      blockers.push({
        code: 'MISSING_RIGHTS_STATUS',
        message: `Novena "${n.slug}" is missing explicit rightsStatus.`,
        context: { slug: n.slug },
      });
    }

    if (!n.exactSource || !n.sourceOrganization) {
      blockers.push({
        code: 'UNSOURCED_NOVENA',
        message: `Novena "${n.slug}" lacks explicit source or organization attribution.`,
        context: { slug: n.slug },
      });
    }

    if (n.saintSlug && !saintSlugs.has(n.saintSlug)) {
      blockers.push({
        code: 'BROKEN_SAINT_NOVENA_ASSOCIATION',
        message: `Novena "${n.slug}" references non-existent Saint slug "${n.saintSlug}"`,
        context: { novenaSlug: n.slug, saintSlug: n.saintSlug },
      });
    }

    // Validate Novena Days
    const dayNumbersSeen = new Set<number>();
    totalNovenaDays += n.days.length;

    for (const d of n.days) {
      if (dayNumbersSeen.has(d.dayNumber)) {
        blockers.push({
          code: 'NOVENA_DAY_DUPLICATE',
          message: `Novena "${n.slug}" contains duplicate day number ${d.dayNumber}`,
          context: { novenaSlug: n.slug, dayNumber: d.dayNumber },
        });
      }
      dayNumbersSeen.add(d.dayNumber);

      if (!d.prayerText || d.prayerText.trim().length < 10) {
        blockers.push({
          code: 'UNSOURCED_NOVENA',
          message: `Novena "${n.slug}" Day ${d.dayNumber} prayer text is missing or insufficient.`,
          context: { novenaSlug: n.slug, dayNumber: d.dayNumber },
        });
      }
    }

    // Check for 9-day completeness and gaps in 1..N
    if (n.days.length !== 9) {
      blockers.push({
        code: 'NOVENA_DAY_GAP',
        message: `Novena "${n.slug}" does not contain expected 9 days (got ${n.days.length} days)`,
        context: { novenaSlug: n.slug, actualCount: n.days.length },
      });
    }

    const sortedDays = n.days.map((d) => d.dayNumber).sort((a, b) => a - b);
    for (let i = 0; i < sortedDays.length; i++) {
      const expected = i + 1;
      if (sortedDays[i] !== expected) {
        blockers.push({
          code: 'NOVENA_DAY_GAP',
          message: `Novena "${n.slug}" has day gap. Expected day ${expected}, got ${sortedDays[i]}`,
          context: { novenaSlug: n.slug, expectedDay: expected, actualDay: sortedDays[i] },
        });
      }
    }

    if (n.rightsStatus === 'PUBLIC_DOMAIN_CONFIRMED') publicDomainCount++;
    if (n.rightsStatus === 'REQUIRES_RIGHTS_REVIEW') requiresRightsReviewCount++;
    if (n.rightsStatus === 'ORIGINAL_EDITORIAL_TEXT') originalEditorialCount++;
  }

  return {
    isValid: blockers.length === 0,
    blockers,
    warnings,
    summary: {
      totalSaints: saints.length,
      totalPrayers: prayers.length,
      totalNovenas: novenas.length,
      totalNovenaDays,
      publicDomainCount,
      requiresRightsReviewCount,
      originalEditorialCount,
    },
  };
}
