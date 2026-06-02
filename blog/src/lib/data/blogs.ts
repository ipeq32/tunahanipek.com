import { prisma } from '@/lib/prisma';
import { blogListInclude, mapBlogToResponse } from '@/lib/blog-mapper';
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
};

function buildWhere(filters: BlogFilters) {
  const search = filters.search?.trim();
  const tag = filters.tag?.trim().toLowerCase();
  const category = filters.category?.trim();

  return {
    deletedAt: null,
    published: true,
    ...(tag
      ? { tags: { some: { name: tag, deletedAt: null } } }
      : {}),
    ...(category
      ? { categories: { some: { name: category, deletedAt: null } } }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { summary: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
}

export async function getPublishedBlogs(
  page = 1,
  limit = 9,
  filters: BlogFilters = {}
): Promise<BlogListResult> {
  const offset = (page - 1) * limit;
  const where = buildWhere(filters);

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
    data: blogs.map(mapBlogToResponse),
    total,
    page,
    limit,
  };
}

export async function getPublishedBlogById(
  id: string
): Promise<IGetBlog | null> {
  const blog = await prisma.blog.findUnique({
    where: { id, deletedAt: null, published: true },
    include: blogListInclude,
  });

  return blog ? mapBlogToResponse(blog) : null;
}

export async function getBlogById(id: string): Promise<IGetBlog | null> {
  const blog = await prisma.blog.findUnique({
    where: { id, deletedAt: null },
    include: blogListInclude,
  });

  return blog ? mapBlogToResponse(blog) : null;
}
