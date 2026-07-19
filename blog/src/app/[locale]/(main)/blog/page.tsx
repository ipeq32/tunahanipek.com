import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogsFeature from './_features/Blogs';
import PaginationComponent from '@/components/pagination';
import BlogSearch from '@/components/blog/BlogSearch';
import TaxonomyFilter from '@/components/blog/TaxonomyFilter';
import { getPublishedBlogs } from '@/lib/data/blogs';
import { withPublicDataFallback } from '@/lib/data/with-public-data-fallback';
import { getAllCategories, getAllTags } from '@/lib/blog-taxonomy';
import { DEFAULT_PAGE_SIZE, parseLimit, parsePage } from '@/lib/pagination';
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
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    tag?: string;
    category?: string;
  }>;
};

async function page({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePage(resolvedSearchParams.page);
  const limit = parseLimit(resolvedSearchParams.limit ?? DEFAULT_PAGE_SIZE);
  const query = resolvedSearchParams.q ?? '';
  const tag = resolvedSearchParams.tag;
  const category = resolvedSearchParams.category;
  const t = await getTranslations('Blog');

  const [tags, categories, { data: blogData, total }] = await Promise.all([
    getAllTags(),
    getAllCategories(),
    withPublicDataFallback(
      'blog.list',
      () =>
        getPublishedBlogs(currentPage, limit, {
          search: query || undefined,
          tag,
          category,
          locale,
        }),
      { data: [], total: 0, page: currentPage, limit },
    ),
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
      <BlogsFeature key={locale} data={blogData} />
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
