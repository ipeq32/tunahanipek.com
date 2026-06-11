import { prisma } from '@/lib/prisma';
import { blogListInclude, mapBlogToResponse } from '@/lib/blog-mapper';
import { publishedTranslationFilter } from '@/lib/published-translation-query';
import { logger } from '@/lib/logger';
import { apiError } from '@/lib/api-i18n';
import { resolveRequestLocale } from '@/lib/languages';
import { PUBLIC_READ_CACHE_HEADERS } from '@/lib/api-cache';
import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET(request: Request) {
  const locale = await resolveRequestLocale(request);
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const search = searchParams.get('q') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const offset = (page - 1) * limit;

  const where = {
    deletedAt: null,
    translations: publishedTranslationFilter(locale, search ?? undefined),
    ...(tag?.trim()
      ? { tags: { some: { name: tag.trim().toLowerCase(), deletedAt: null } } }
      : {}),
    ...(category?.trim()
      ? {
          categories: {
            some: { name: category.trim(), deletedAt: null },
          },
        }
      : {}),
  };

  try {
    const [totalBlogs, blogs] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        skip: offset,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        where,
        include: blogListInclude,
      }),
    ]);

    const data = blogs.map((blog) => mapBlogToResponse(blog, locale));

    return NextResponse.json(
      { data, total: totalBlogs, page, limit, locale },
      { status: 200, headers: PUBLIC_READ_CACHE_HEADERS },
    );
  } catch (error) {
    logger.error('Failed to fetch blogs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return apiError(request, 'internalError', 500);
  }
}
