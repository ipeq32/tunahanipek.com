import { cache } from 'react';

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  blogDetailInclude,
  blogListInclude,
  mapBlogToResponse,
} from '@/lib/blog-mapper';
import { publishedTranslationFilter } from '@/lib/published-translation-query';
import { resolveLanguageCode } from '@/lib/languages';
import {
  buildPaginatedResult,
  DEFAULT_PAGE_SIZE,
  type PageSize,
  type PaginatedResult,
} from '@/lib/pagination';
import { IGetBlog } from '@/types/blog';

type BlogListResult = {
  data: IGetBlog[];
  total: number;
  page: number;
  limit: number;
};

type BlogFilters = {
  search?: string;
  tag?: string;
  category?: string;
  locale?: string;
};

async function buildWhere(filters: BlogFilters, locale: string) {
  const search = filters.search?.trim();
  const tag = filters.tag?.trim().toLowerCase();
  const category = filters.category?.trim();

  return {
    deletedAt: null,
    translations: publishedTranslationFilter(locale, search),
    ...(tag
      ? { tags: { some: { name: tag, deletedAt: null } } }
      : {}),
    ...(category
      ? { categories: { some: { name: category, deletedAt: null } } }
      : {}),
  };
}

export async function getPublishedBlogs(
  page = 1,
  limit: number = DEFAULT_PAGE_SIZE,
  filters: BlogFilters = {},
): Promise<BlogListResult> {
  const locale = await resolveLanguageCode(filters.locale);
  const offset = (page - 1) * limit;
  const where = await buildWhere(filters, locale);

  const [total, blogs] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      skip: offset,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      where,
      include: blogListInclude,
    }),
  ]);

  return {
    data: blogs.map((blog) => mapBlogToResponse(blog, locale)),
    total,
    page,
    limit,
  };
}

async function fetchPublishedBlogById(
  id: string,
  localeInput?: string,
): Promise<IGetBlog | null> {
  const locale = await resolveLanguageCode(localeInput);

  const blog = await prisma.blog.findFirst({
    where: {
      id,
      deletedAt: null,
      translations: publishedTranslationFilter(locale),
    },
    include: blogDetailInclude,
  });

  return blog ? mapBlogToResponse(blog, locale) : null;
}

/** Metadata + sayfa dedupe için request-scoped cache. */
export const getPublishedBlogById = cache(fetchPublishedBlogById);

export async function getBlogById(
  id: string,
  localeInput?: string,
  options?: { includeAllTranslations?: boolean },
): Promise<IGetBlog | null> {
  const locale = await resolveLanguageCode(localeInput);

  const blog = await prisma.blog.findUnique({
    where: { id, deletedAt: null },
    include: blogDetailInclude,
  });

  return blog
    ? mapBlogToResponse(blog, locale, {
        includeAllTranslations: options?.includeAllTranslations,
      })
    : null;
}

export async function getAdminBlogs(localeInput?: string): Promise<IGetBlog[]> {
  const result = await getAdminBlogsPaginated(localeInput ?? 'tr', 1, 100);
  return result.data;
}

type AdminBlogFilters = {
  search?: string;
  status?: 'all' | 'published' | 'drafts';
};

export type AdminBlogStats = {
  total: number;
  published: number;
  drafts: number;
};

function buildAdminBlogWhere(
  locale: string,
  filters: AdminBlogFilters = {}
): Prisma.BlogWhereInput {
  const search = filters.search?.trim();
  const conditions: Prisma.BlogWhereInput[] = [{ deletedAt: null }];

  if (filters.status === 'published') {
    conditions.push({
      translations: {
        some: {
          published: true,
          language: { code: locale },
        },
      },
    });
  }

  if (filters.status === 'drafts') {
    conditions.push({
      NOT: {
        translations: {
          some: {
            published: true,
            language: { code: locale },
          },
        },
      },
    });
  }

  if (search) {
    conditions.push({
      OR: [
        {
          translations: {
            some: {
              language: { code: locale },
              title: { contains: search, mode: 'insensitive' },
            },
          },
        },
        {
          author: {
            is: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ],
    });
  }

  return { AND: conditions };
}

export async function getAdminBlogStats(
  localeInput?: string
): Promise<AdminBlogStats> {
  const locale = await resolveLanguageCode(localeInput);
  const baseWhere = { deletedAt: null };

  const [total, published] = await Promise.all([
    prisma.blog.count({ where: baseWhere }),
    prisma.blog.count({
      where: {
        ...baseWhere,
        translations: {
          some: {
            published: true,
            language: { code: locale },
          },
        },
      },
    }),
  ]);

  return {
    total,
    published,
    drafts: total - published,
  };
}

export async function getAdminBlogsPaginated(
  localeInput: string,
  page: number,
  limit: PageSize,
  filters: AdminBlogFilters = {}
): Promise<PaginatedResult<IGetBlog> & { stats: AdminBlogStats }> {
  const locale = await resolveLanguageCode(localeInput);
  const skip = (page - 1) * limit;
  const where = buildAdminBlogWhere(locale, filters);

  const [total, blogs, stats] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: blogDetailInclude,
    }),
    getAdminBlogStats(locale),
  ]);

  return {
    ...buildPaginatedResult(
      blogs.map((blog) =>
        mapBlogToResponse(blog, locale, { includeAllTranslations: true })
      ),
      page,
      limit,
      total
    ),
    stats,
  };
}
