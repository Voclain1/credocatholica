import sanitizeHtml from 'sanitize-html';
import { SanitizationResult } from './types.js';

export const SANITIZER_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'em',
    'strong',
    'b',
    'i',
    'blockquote',
    'ul',
    'ol',
    'li',
    'h2',
    'h3',
    'h4',
    'a',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  disallowedTagsMode: 'discard',
};

export function sanitizeContent(htmlInput: string): SanitizationResult {
  if (!htmlInput) {
    return { sanitizedHtml: '', textOnly: '', wasModified: false };
  }

  const sanitizedHtml = sanitizeHtml(htmlInput, SANITIZER_OPTIONS);
  const textOnly = sanitizeHtml(htmlInput, { allowedTags: [], allowedAttributes: {} }).trim();
  const wasModified = sanitizedHtml.trim() !== htmlInput.trim();

  let reason: string | undefined;
  if (wasModified) {
    if (htmlInput.includes('<script')) {
      reason = 'unsafe_script_removed';
    } else if (/on\w+=/i.test(htmlInput)) {
      reason = 'event_handler_removed';
    } else if (htmlInput.includes('javascript:')) {
      reason = 'javascript_scheme_removed';
    } else {
      reason = 'unsafe_markup_sanitized';
    }
  }

  return {
    sanitizedHtml,
    textOnly,
    wasModified,
    reason,
  };
}
