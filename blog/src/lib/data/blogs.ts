import { prisma } from '@/lib/prisma';
import {
  blogListInclude,
  mapBlogToResponse,
} from '@/lib/blog-mapper';
import { resolveLanguageCode } from '@/lib/languages';
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
    translations: {
      some: {
        published: true,
        language: { code: locale, isActive: true },
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { summary: { contains: search, mode: 'insensitive' as const } },
                { content: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
    },
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
  limit = 9,
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

export async function getPublishedBlogById(
  id: string,
  localeInput?: string,
): Promise<IGetBlog | null> {
  const locale = await resolveLanguageCode(localeInput);

  const blog = await prisma.blog.findFirst({
    where: {
      id,
      deletedAt: null,
      translations: {
        some: {
          published: true,
          language: { code: locale, isActive: true },
        },
      },
    },
    include: blogListInclude,
  });

  return blog ? mapBlogToResponse(blog, locale) : null;
}

export async function getBlogById(
  id: string,
  localeInput?: string,
  options?: { includeAllTranslations?: boolean },
): Promise<IGetBlog | null> {
  const locale = await resolveLanguageCode(localeInput);

  const blog = await prisma.blog.findUnique({
    where: { id, deletedAt: null },
    include: blogListInclude,
  });

  return blog
    ? mapBlogToResponse(blog, locale, {
        includeAllTranslations: options?.includeAllTranslations,
      })
    : null;
}

export async function getAdminBlogs(localeInput?: string): Promise<IGetBlog[]> {
  const locale = await resolveLanguageCode(localeInput);

  const blogs = await prisma.blog.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    include: blogListInclude,
  });

  return blogs.map((blog) =>
    mapBlogToResponse(blog, locale, { includeAllTranslations: true }),
  );
}
