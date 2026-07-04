export function stripHtmlText(value?: string): string {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function isShortHtmlContent(value?: string, maxLength = 80): boolean {
  const text = stripHtmlText(value);
  return text.length > 0 && text.length < maxLength;
}

export function hasBlogExpandSeed(fields: {
  title?: string;
  content?: string;
  summary?: string;
}): boolean {
  return Boolean(
    fields.title?.trim() ||
      stripHtmlText(fields.summary).length >= 3 ||
      stripHtmlText(fields.content).length >= 3,
  );
}

export function canExpandBlogTranslation(
  fields: {
    title?: string;
    content?: string;
    summary?: string;
  },
  activeFilled: boolean,
): boolean {
  if (activeFilled || !hasBlogExpandSeed(fields)) {
    return false;
  }

  const content = stripHtmlText(fields.content);
  const summary = stripHtmlText(fields.summary);

  return (
    !content ||
    isShortHtmlContent(fields.content) ||
    !summary ||
    isShortHtmlContent(fields.summary)
  );
}

export function hasProjectExpandSeed(
  fields: {
    title?: string;
    description?: string;
  },
  projectUrl?: string | null,
): boolean {
  return Boolean(
    fields.title?.trim() ||
      stripHtmlText(fields.description).length >= 3 ||
      projectUrl?.trim(),
  );
}

export function canExpandProjectTranslation(
  fields: {
    title?: string;
    description?: string;
  },
  projectUrl: string | undefined | null,
  activeFilled: boolean,
): boolean {
  if (activeFilled || !hasProjectExpandSeed(fields, projectUrl)) {
    return false;
  }

  const description = stripHtmlText(fields.description);
  return !description || isShortHtmlContent(fields.description);
}

export function isBlogTranslationFilled(fields: {
  title?: string;
  content?: string;
  summary?: string;
}): boolean {
  return (
    Boolean(fields.title?.trim()) &&
    stripHtmlText(fields.content).length >= 10 &&
    stripHtmlText(fields.summary).length >= 10
  );
}

export function isProjectTranslationFilled(fields: {
  title?: string;
  description?: string;
}): boolean {
  return (
    Boolean(fields.title?.trim()) &&
    stripHtmlText(fields.description).length >= 10
  );
}

export function filterBlogTranslationsForSubmit<
  T extends { languageCode: string; title: string; content: string; summary: string },
>(items: T[]): T[] {
  return items.filter((item) => isBlogTranslationFilled(item));
}

export function filterProjectTranslationsForSubmit<
  T extends {
    languageCode: string;
    title: string;
    description: string;
  },
>(items: T[]): T[] {
  return items.filter((item) => isProjectTranslationFilled(item));
}
