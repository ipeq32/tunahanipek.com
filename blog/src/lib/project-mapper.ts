import { normalizeStoredRichField } from '@/lib/rich-content';
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
  isLocaleFallback: boolean;
  availableLocales: string[];
  translations?: ProjectTranslationDto[];
  createdAt: Date;
  updatedAt: Date;
};

function mapTranslationRow(row: ProjectTranslationRow): ProjectTranslationDto {
  return {
    languageCode: row.language.code,
    title: row.title,
    description: normalizeStoredRichField(row.description, {
      contentType: 'project',
      field: 'description',
    }),
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

type PickedTranslation = {
  translation: ProjectTranslationRow | null;
  isLocaleFallback: boolean;
};

function pickPublishedTranslation(
  translations: ProjectTranslationRow[],
  locale: string,
): PickedTranslation {
  const published = translations.filter((translation) => translation.published);

  const exact = published.find((translation) => translation.language.code === locale);
  if (exact) {
    return { translation: exact, isLocaleFallback: false };
  }

  const defaultTranslation = published.find(
    (translation) => translation.language.code === defaultLocale,
  );
  if (defaultTranslation) {
    return {
      translation: defaultTranslation,
      isLocaleFallback: locale !== defaultLocale,
    };
  }

  const fallback = published[0] ?? null;
  return {
    translation: fallback,
    isLocaleFallback: fallback ? fallback.language.code !== locale : false,
  };
}

export function mapProjectToDto(
  project: ProjectWithTranslations,
  locale: string,
  options?: { includeAllTranslations?: boolean },
): ProjectDto {
  const forPublic = !options?.includeAllTranslations;
  const picked = forPublic
    ? pickPublishedTranslation(project.translations, locale)
    : {
        translation: pickTranslation(project.translations, locale),
        isLocaleFallback: false,
      };
  const translation = picked.translation;
  const availableLocales = project.translations
    .filter((t) => t.published || options?.includeAllTranslations)
    .map((t) => t.language.code);

  return {
    id: project.id,
    title: translation?.title ?? '',
    description: translation
      ? normalizeStoredRichField(translation.description, {
          contentType: 'project',
          field: 'description',
        })
      : '',
    url: project.url,
    image: project.image,
    sortOrder: project.sortOrder,
    published: translation?.published ?? false,
    locale: translation?.language.code ?? locale,
    isLocaleFallback: picked.isLocaleFallback,
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

