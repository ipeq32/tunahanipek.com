import { Role } from '@prisma/client';
import { IGetBlog, BlogTranslationDto } from '@/types/blog';
import { normalizeStoredRichField } from '@/lib/rich-content';
import { defaultLocale } from '@/config';

type TranslationRow = {
  title: string;
  content?: string;
  summary: string;
  published: boolean;
  language: { code: string };
};

type AuthorSelect = {
  name: string;
  image: string | null;
  role: Role;
} | null;

type BlogWithRelations = {
  id: string;
  image: string;
  shortImage: string;
  createdAt: Date;
  updatedAt: Date;
  author: AuthorSelect;
  tags?: { name: string }[];
  categories?: { name: string }[];
  translations: TranslationRow[];
};

function mapTranslationRow(row: TranslationRow): BlogTranslationDto {
  return {
    languageCode: row.language.code,
    title: row.title,
    content: normalizeStoredRichField(row.content ?? '', {
      contentType: 'blog',
      field: 'content',
    }),
    summary: normalizeStoredRichField(row.summary, {
      contentType: 'blog',
      field: 'summary',
    }),
    published: row.published,
  };
}

function pickTranslation(
  translations: TranslationRow[],
  locale: string,
): TranslationRow | null {
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
  translation: TranslationRow | null;
  isLocaleFallback: boolean;
};

function pickPublishedTranslation(
  translations: TranslationRow[],
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

export function mapBlogToResponse(
  blog: BlogWithRelations,
  locale: string,
  options?: { includeAllTranslations?: boolean },
): IGetBlog {
  const forPublic = !options?.includeAllTranslations;
  const picked = forPublic
    ? pickPublishedTranslation(blog.translations, locale)
    : {
        translation: pickTranslation(blog.translations, locale),
        isLocaleFallback: false,
      };
  const translation = picked.translation;
  const availableLocales = blog.translations
    .filter((t) => t.published || options?.includeAllTranslations)
    .map((t) => t.language.code);

  return {
    id: blog.id,
    title: translation?.title ?? '',
    content: translation?.content
      ? normalizeStoredRichField(translation.content, {
          contentType: 'blog',
          field: 'content',
        })
      : '',
    summary: translation
      ? normalizeStoredRichField(translation.summary, {
          contentType: 'blog',
          field: 'summary',
        })
      : '',
    image: blog.image,
    shortImage: blog.shortImage,
    published: translation?.published ?? false,
    locale: translation?.language.code ?? locale,
    isLocaleFallback: picked.isLocaleFallback,
    availableLocales: [...new Set(availableLocales)],
    translations: options?.includeAllTranslations
      ? blog.translations.map(mapTranslationRow)
      : undefined,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    tags: blog.tags?.map((t) => t.name) ?? [],
    categories: blog.categories?.map((c) => c.name) ?? [],
    author: blog.author
      ? {
          name: blog.author.name,
          image: blog.author.image ?? '',
          role: blog.author.role,
        }
      : {
          name: 'Anonim',
          image: '',
          role: 'USER',
        },
  };
}

export const blogAuthorSelect = {
  select: {
    name: true,
    image: true,
    role: true,
  },
} as const;

const blogTranslationLanguageSelect = {
  language: { select: { code: true } },
} as const;

/** Liste/kart görünümleri — tam içerik çekilmez. */
export const blogListInclude = {
  author: blogAuthorSelect,
  tags: { select: { name: true } },
  categories: { select: { name: true } },
  translations: {
    select: {
      title: true,
      summary: true,
      published: true,
      language: { select: { code: true } },
    },
  },
} as const;

/** Detay ve düzenleme — tüm çeviri alanları. */
export const blogDetailInclude = {
  author: blogAuthorSelect,
  tags: { select: { name: true } },
  categories: { select: { name: true } },
  translations: {
    include: blogTranslationLanguageSelect,
  },
} as const;
