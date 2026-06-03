import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogsFeature from './_features/Blogs';
import PaginationComponent from '@/components/pagination';
import BlogSearch from '@/components/blog/BlogSearch';
import TaxonomyFilter from '@/components/blog/TaxonomyFilter';
import { getPublishedBlogs } from '@/lib/data/blogs';
import { getAllCategories, getAllTags } from '@/lib/blog-taxonomy';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    route: '/blog',
  });
}

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    tag?: string;
    category?: string;
  }>;
};

async function page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1');
  const limit = parseInt(resolvedSearchParams.limit || '9');
  const query = resolvedSearchParams.q ?? '';
  const tag = resolvedSearchParams.tag;
  const category = resolvedSearchParams.category;
  const t = await getTranslations('Blog');

  const [tags, categories, { data: blogData, total }] = await Promise.all([
    getAllTags(),
    getAllCategories(),
    getPublishedBlogs(currentPage, limit, {
      search: query || undefined,
      tag,
      category,
    }),
  ]);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <BlogSearch initialQuery={query} />
      <TaxonomyFilter
        tags={tags}
        categories={categories}
        activeTag={tag}
        activeCategory={category}
      />
      <BlogsFeature data={blogData} />
      <PaginationComponent
        total={total}
        currentPage={currentPage}
        limit={limit}
        isShowPagination={total > limit}
        searchQuery={query || undefined}
        activeTag={tag}
        activeCategory={category}
      />
    </>
  );
}

export default page;
