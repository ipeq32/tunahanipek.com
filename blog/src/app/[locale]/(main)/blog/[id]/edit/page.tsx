import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogForm from '@/components/blog/BlogForm';
import { getBlogById } from '@/lib/data/blogs';
import { auth } from '@/auth';
import {
  canUpdateAnyBlog,
  hasUserPermission,
} from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { notFound } from 'next/navigation';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function EditBlogPage({ params }: Props) {
  const { id, locale } = await params;
  const session = await auth();
  const t = await getTranslations('Blog.Edit');

  const user = session?.user;
  const canUpdateOwn = hasUserPermission(
    user?.permissions,
    PERMISSIONS['blog:update'],
    user?.email
  );
  const canUpdateAny = canUpdateAnyBlog(user?.permissions, user?.email);

  if (!user || (!canUpdateOwn && !canUpdateAny)) {
    redirect({ href: '/auth/login', locale });
  }

  const blog = await getBlogById(id, locale, { includeAllTranslations: true });

  if (!blog) {
    notFound();
  }

  const raw = await prisma.blog.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!raw || (!canUpdateAny && raw.authorId !== user.id)) {
    redirect({ href: '/blog', locale });
  }

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <BlogForm
        mode="edit"
        blogId={id}
        defaultValues={{
          image: blog.image,
          shortImage: blog.shortImage,
          tags: blog.tags.join(', '),
          categories: blog.categories.join(', '),
          translations: blog.translations?.map((translation) => ({
            languageCode: translation.languageCode,
            title: translation.title,
            content: translation.content,
            summary: translation.summary,
          })),
        }}
      />
    </>
  );
}