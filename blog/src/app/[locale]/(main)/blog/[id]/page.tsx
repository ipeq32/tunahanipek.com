import BlogFeature from './_features/Blog';
import BlogComments from '@/components/blog/BlogComments';
import { getSession } from '@/lib/cached-session';
import { getPublishedBlogById } from '@/lib/data/blogs';
import { getApprovedCommentViewsPaginated } from '@/lib/data/comments';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { parseLocale } from '@/i18n/request';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { buildArticleJsonLd } from '@/lib/json-ld';
import {
  getCanonicalPath,
  getLanguageAlternates,
  getLocalizedPathname,
} from '@/lib/localized-path';

export const revalidate = 60;

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const locale = parseLocale(await getLocale());
  const [blog, t] = await Promise.all([
    getPublishedBlogById(id, locale),
    getTranslations('Blog'),
  ]);

  if (!blog) {
    return { title: t('notFoundTitle') };
  }

  const plainSummary = blog.summary.replace(/<[^>]*>/g, '').slice(0, 160);
  const images = blog.image ? [blog.image] : [];
  const canonical = getCanonicalPath('/blog/[id]', locale, { '[id]': id });
  const languages = getLanguageAlternates(
    '/blog/[id]',
    { '[id]': id },
    blog.availableLocales,
  );

  return {
    title: blog.title,
    description: plainSummary,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: blog.title,
      description: plainSummary,
      type: 'article',
      locale,
      url: canonical,
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

  const session = await getSession();
  const [blogData, commentsResult] = await Promise.all([
    getPublishedBlogById(id, locale),
    getApprovedCommentViewsPaginated(id, locale, 1, DEFAULT_PAGE_SIZE, session?.user?.id),
  ]);

  if (!blogData) {
    notFound();
  }

  const blogPath = getLocalizedPathname('/blog/[id]', locale, { '[id]': id });
  const plainSummary = blogData.summary.replace(/<[^>]*>/g, '').slice(0, 160);

  return (
    <>
      <JsonLd
        data={buildArticleJsonLd({
          locale,
          path: blogPath,
          title: blogData.title,
          description: plainSummary,
          image: blogData.image,
          datePublished: blogData.createdAt,
          dateModified: blogData.updatedAt,
        })}
      />
      <BlogFeature data={blogData} />
      <BlogComments
        blogId={id}
        locale={locale}
        isAuthenticated={!!session?.user}
        initialComments={commentsResult.data}
        initialPagination={commentsResult.pagination}
      />
    </>
  );
}

export default page;
