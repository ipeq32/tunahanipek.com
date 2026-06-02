import { Role } from '@prisma/client';
import { IGetBlog } from '@/types/blog';

type AuthorSelect = {
  name: string;
  image: string | null;
  role: Role;
} | null;

type BlogWithAuthor = {
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
};

export function mapBlogToResponse(blog: BlogWithAuthor): IGetBlog {
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
