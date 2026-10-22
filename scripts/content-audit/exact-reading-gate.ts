import { resolveScripture } from './scripture-source.js';

interface ReadingText {
  scriptureRef?: string;
  text: string;
  textStatus?: string;
}

interface ReadingPackage {
  records: Array<{
    date: string;
    readings?: ReadingText[];
    readingSets?: Array<{
      readings: ReadingText[];
    }>;
  }>;
}

/** Complete before the first database write, including for legacy approved packages. */
export function assertExactReadingTexts(pkg: ReadingPackage): void {
  const failures: string[] = [];
  for (const day of pkg.records) {
    for (const set of [...(day.readingSets ?? []), ...(day.readings ? [{ readings: day.readings }] : [])]) {
      for (const reading of set.readings) {
        if (reading.textStatus === 'REQUIRES_MANUAL_SEGMENT_REVIEW' || reading.textStatus === 'TEXT_UNAVAILABLE') continue;
        if (reading.textStatus && reading.textStatus !== 'VERIFIED_EXACT') {
          failures.push(`${day.date}: unrecognized text status`);
          continue;
        }
        if (!reading.scriptureRef) {
          failures.push(`${day.date}: VERIFIED_EXACT requires an explicit Douay-Rheims scriptureRef`);
          continue;
        }
        const resolved = resolveScripture(reading.scriptureRef);
        if (resolved.status !== 'RESOLVED') {
          failures.push(`${day.date} ${reading.scriptureRef}: ${resolved.reason}`);
        } else if (reading.text !== resolved.text) {
          failures.push(`${day.date} ${reading.scriptureRef}: text differs from pinned source`);
        }
      }
    }
  }
  if (failures.length) {
    throw new Error(`APPLY ABORTED: ${failures.length} exact-text claim(s) failed source comparison. ` + failures.slice(0, 10).join('; '));
  }
}
