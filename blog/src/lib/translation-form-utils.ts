import { isUsableExternalUrl } from '@/lib/validations/url-field';

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
      stripHtmlText(fields.summary).length >= 1 ||
      stripHtmlText(fields.content).length >= 1,
  );
}

export function canExpandBlogTranslation(fields: {
  title?: string;
  content?: string;
  summary?: string;
}): boolean {
  return hasBlogExpandSeed(fields);
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
      stripHtmlText(fields.description).length >= 1 ||
      isUsableExternalUrl(projectUrl),
  );
}

export function canExpandProjectTranslation(
  fields: {
    title?: string;
    description?: string;
  },
  projectUrl: string | undefined | null,
): boolean {
  return hasProjectExpandSeed(fields, projectUrl);
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
