import type { LanguageDto } from '@/lib/languages';
import { isProjectTranslationFilled } from '@/lib/translation-form-utils';

export type BlogTranslationFormValue = {
  title: string;
  content: string;
  summary: string;
};

export type ProjectTranslationFormValue = {
  title: string;
  description: string;
};

export function deriveProjectPublished(
  translations: Record<string, Pick<ProjectTranslationFormValue, 'title' | 'description'> & {
    published?: boolean;
  }>,
): boolean {
  const filled = Object.values(translations).filter((item) =>
    isProjectTranslationFilled(item),
  );

  if (filled.length === 0) {
    return false;
  }

  return filled.every((item) => item.published === true);
}

export function buildEmptyBlogTranslations(
  languages: LanguageDto[],
): Record<string, BlogTranslationFormValue> {
  return Object.fromEntries(
    languages.map((language) => [
      language.code,
      {
        title: '',
        content:
          language.code === 'tr' ? '<p>İçerik</p>' : '<p>Content</p>',
        summary: language.code === 'tr' ? '<p>Özet</p>' : '<p>Summary</p>',
      },
    ]),
  );
}

export function buildEmptyProjectTranslations(
  languages: LanguageDto[],
): Record<string, ProjectTranslationFormValue> {
  return Object.fromEntries(
    languages.map((language) => [
      language.code,
      {
        title: '',
        description: '',
      },
    ]),
  );
}

export function blogTranslationsFromDto(
  languages: LanguageDto[],
  translations?: Array<{
    languageCode: string;
    title: string;
    content: string;
    summary: string;
  }>,
): Record<string, BlogTranslationFormValue> {
  const base = buildEmptyBlogTranslations(languages);

  for (const item of translations ?? []) {
    if (base[item.languageCode]) {
      base[item.languageCode] = {
        title: item.title,
        content: item.content,
        summary: item.summary,
      };
    }
  }

  return base;
}

export function projectTranslationsFromDto(
  languages: LanguageDto[],
  translations?: Array<{
    languageCode: string;
    title: string;
    description: string;
    published: boolean;
  }>,
): Record<string, ProjectTranslationFormValue> {
  const base = buildEmptyProjectTranslations(languages);

  for (const item of translations ?? []) {
    if (base[item.languageCode]) {
      base[item.languageCode] = {
        title: item.title,
        description: item.description,
      };
    }
  }

  return base;
}
