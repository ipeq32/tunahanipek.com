import { prisma } from '@/lib/prisma';
import { blogAuthorSelect, mapBlogToResponse } from '@/lib/blog-mapper';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const search = searchParams.get('q') ?? undefined;
  const offset = (page - 1) * limit;

  const where = {
    deletedAt: null,
    published: true,
    ...(search?.trim()
      ? {
          OR: [
            { title: { contains: search.trim(), mode: 'insensitive' as const } },
            {
              summary: { contains: search.trim(), mode: 'insensitive' as const },
            },
            {
              content: { contains: search.trim(), mode: 'insensitive' as const },
            },
          ],
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
        include: {
          author: blogAuthorSelect,
        },
      }),
    ]);

    const data = blogs.map(mapBlogToResponse);

    return NextResponse.json(
      { data, total: totalBlogs, page, limit },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to fetch blogs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
