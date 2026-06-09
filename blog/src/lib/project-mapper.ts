import { sanitizeHtml } from '@/lib/sanitize';
import { defaultLocale } from '@/config';

type ProjectTranslationRow = {
  title: string;
  description: string;
  published: boolean;
  language: { code: string };
};

type ProjectWithTranslations = {
  id: string;
  url: string | null;
  image: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  translations: ProjectTranslationRow[];
};

export type ProjectTranslationDto = {
  languageCode: string;
  title: string;
  description: string;
  published: boolean;
};

export type ProjectDto = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  image: string | null;
  sortOrder: number;
  published: boolean;
  locale: string;
  availableLocales: string[];
  translations?: ProjectTranslationDto[];
  createdAt: Date;
  updatedAt: Date;
};

function mapTranslationRow(row: ProjectTranslationRow): ProjectTranslationDto {
  return {
    languageCode: row.language.code,
    title: row.title,
    description: sanitizeHtml(row.description),
    published: row.published,
  };
}

function pickTranslation(
  translations: ProjectTranslationRow[],
  locale: string,
): ProjectTranslationRow | null {
  const exact = translations.find((t) => t.language.code === locale);
  if (exact) {
    return exact;
  }

  const defaultTranslation = translations.find(
    (t) => t.language.code === defaultLocale,
  );
  if (defaultTranslation) {
    return defaultTranslation;
  }

  return translations[0] ?? null;
}

export function mapProjectToDto(
  project: ProjectWithTranslations,
  locale: string,
  options?: { includeAllTranslations?: boolean },
): ProjectDto {
  const translation = pickTranslation(project.translations, locale);
  const availableLocales = project.translations
    .filter((t) => t.published || options?.includeAllTranslations)
    .map((t) => t.language.code);

  return {
    id: project.id,
    title: translation?.title ?? '',
    description: translation ? sanitizeHtml(translation.description) : '',
    url: project.url,
    image: project.image,
    sortOrder: project.sortOrder,
    published: translation?.published ?? false,
    locale: translation?.language.code ?? locale,
    availableLocales: [...new Set(availableLocales)],
    translations: options?.includeAllTranslations
      ? project.translations.map(mapTranslationRow)
      : undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export const projectListInclude = {
  translations: {
    include: {
      language: { select: { code: true } },
    },
  },
} as const;
