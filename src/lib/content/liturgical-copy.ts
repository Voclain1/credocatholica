/** Remove known internal diagnostics from editorial notes, never from Scripture. */
export function cleanLiturgicalNotes(notes: string | null | undefined): string | null {
  if (!notes) return null;
  return notes.replace(/\b[Pp]rincipal celebration null\.?(?:\s*\d+ alternative reading sets\.?)?/g, '').replace(/\s{2,}/g, ' ').trim() || null;
}
