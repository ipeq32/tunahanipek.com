/** Quill / AI kaynaklı &nbsp; ve U+00A0 — satır kırılımını engelleyen taşmayı önler. */
export function normalizeRichTextWhitespace(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .replace(/&#x0*a0;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u202f/g, ' ')
    .replace(/\u2007/g, ' ');
}
