const LANGUAGE_TAB_LABELS: Record<string, string> = {
  tr: 'TÜRKÇE',
  en: 'ENGLISH',
};

/** Dil sekmelerinde Türkçe locale kaynaklı ENGLİSH hatasını önler. */
export function getLanguageTabLabel(code: string, fallbackName?: string): string {
  const normalized = code.trim().toLowerCase();
  if (LANGUAGE_TAB_LABELS[normalized]) {
    return LANGUAGE_TAB_LABELS[normalized];
  }

  const source = fallbackName?.trim() || normalized;
  return source.toLocaleUpperCase('en-US');
}
