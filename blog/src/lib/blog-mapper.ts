import { Role } from '@prisma/client';
import { IGetBlog } from '@/types/blog';

type AuthorSelect = {
  name: string;
  image: string | null;
  role: Role;
} | null;

type BlogWithRelations = {
  id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  shortImage: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: AuthorSelect;
  tags?: { name: string }[];
  categories?: { name: string }[];
};

export function mapBlogToResponse(blog: BlogWithRelations): IGetBlog {
  return {
    id: blog.id,
    title: blog.title,
    content: blog.content,
    summary: blog.summary,
    image: blog.image,
    shortImage: blog.shortImage,
    published: blog.published,
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

export const blogListInclude = {
  author: blogAuthorSelect,
  tags: { select: { name: true } },
  categories: { select: { name: true } },
} as const;
