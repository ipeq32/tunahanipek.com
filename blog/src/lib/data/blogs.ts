import { prisma } from '@/lib/prisma';
import { blogAuthorSelect, mapBlogToResponse } from '@/lib/blog-mapper';
import { IGetBlog } from '@/types/blog';

type BlogListResult = {
  data: IGetBlog[];
  total: number;
  page: number;
  limit: number;
};

export async function getPublishedBlogs(
  page = 1,
  limit = 9,
  search?: string
): Promise<BlogListResult> {
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

  const [total, blogs] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      skip: offset,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      where,
      include: { author: blogAuthorSelect },
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
    include: { author: blogAuthorSelect },
  });

  return blog ? mapBlogToResponse(blog) : null;
}

export async function getBlogById(id: string): Promise<IGetBlog | null> {
  const blog = await prisma.blog.findUnique({
    where: { id, deletedAt: null },
    include: { author: blogAuthorSelect },
  });

  return blog ? mapBlogToResponse(blog) : null;
}
