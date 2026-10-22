/** A source name or rights label is not evidence of word-for-word fidelity. */
export function assertNoPublishedSeedTargets(records: ReadonlyArray<{ slug: string }>): void {
  if (records.length) {
    throw new Error(
      `Unverified seed data cannot overwrite published content: ${records.map((r) => r.slug).join(', ')}. ` +
      'Use a backed-up, source-verified correction instead.',
    );
  }
}
