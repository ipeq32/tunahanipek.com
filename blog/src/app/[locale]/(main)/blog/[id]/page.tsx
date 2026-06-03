import BlogFeature from './_features/Blog';
import BlogComments from '@/components/blog/BlogComments';
import { auth } from '@/auth';
import { getPublishedBlogById } from '@/lib/data/blogs';
import { getApprovedCommentViews } from '@/lib/data/comments';
import { parseLocale } from '@/i18n/request';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const revalidate = 60;

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [blog, t] = await Promise.all([
    getPublishedBlogById(id),
    getTranslations('Blog'),
  ]);

  if (!blog) {
    return { title: t('notFoundTitle') };
  }

  const locale = parseLocale(await getLocale());
  const plainSummary = blog.summary.replace(/<[^>]*>/g, '').slice(0, 160);
  const images = blog.image ? [blog.image] : [];

  return {
    title: blog.title,
    description: plainSummary,
    alternates: {
      canonical: `/${locale}/blog/${id}`,
    },
    openGraph: {
      title: blog.title,
      description: plainSummary,
      type: 'article',
      locale,
      url: `/${locale}/blog/${id}`,
      images,
    },
    twitter: {
      card: blog.image ? 'summary_large_image' : 'summary',
      title: blog.title,
      description: plainSummary,
      images,
    },
  };
}

async function page({ params }: Props) {
  const { id } = await params;
  const locale = parseLocale(await getLocale());

  const session = await auth();
  const [blogData, comments] = await Promise.all([
    getPublishedBlogById(id),
    getApprovedCommentViews(id, locale, session?.user?.id),
  ]);

  if (!blogData) {
    notFound();
  }

  return (
    <>
      <BlogFeature data={blogData} />
      <BlogComments
        blogId={id}
        locale={locale}
        isAuthenticated={!!session?.user}
        initialComments={comments}
      />
    </>
  );
}

export default page;
