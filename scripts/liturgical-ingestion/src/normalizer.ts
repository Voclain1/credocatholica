import sanitizeHtml from 'sanitize-html';

/**
 * Normalizes Scripture text payload while preserving verbatim wording, punctuation,
 * apostrophes, quotation marks, line breaks, and stanzas.
 *
 * Plain text input is preserved 100% verbatim.
 * HTML markup input strips tags safely without altering text content or decoding entities.
 */
export function sanitizeScriptureText(text: string): string {
  if (!text) return '';

  // If plain text (no HTML tags), return verbatim with line break normalization
  if (!/<[a-z][\s\S]*>/i.test(text)) {
    return text.replace(/\r\n/g, '\n').trim();
  }

  // If HTML markup is present, strip tags while preserving exact entity/text wording
  const clean = sanitizeHtml(text, {
    allowedTags: [], // Strip HTML tags
    allowedAttributes: {},
  });

  return clean.replace(/\r\n/g, '\n').trim();
}

/**
 * Generates a clean URL slug for a celebration or saint.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
