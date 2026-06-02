import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogsFeature from './_features/Blogs';
import PaginationComponent from '@/components/pagination';
import BlogSearch from '@/components/blog/BlogSearch';
import TaxonomyFilter from '@/components/blog/TaxonomyFilter';
import { getPublishedBlogs } from '@/lib/data/blogs';
import { getAllCategories, getAllTags } from '@/lib/blog-taxonomy';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export const revalidate = 60;

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
  const query = resolvedSearchParams.q;
  const tag = resolvedSearchParams.tag;
  const category = resolvedSearchParams.category;
  const t = await getTranslations('Blog');

  const [tags, categories, { data: blogData, total }] = await Promise.all([
    getAllTags(),
    getAllCategories(),
    getPublishedBlogs(currentPage, limit, { search: query, tag, category }),
  ]);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <Suspense fallback={null}>
        <BlogSearch />
      </Suspense>
      <TaxonomyFilter tags={tags} categories={categories} />
      <BlogsFeature data={blogData} />
      <PaginationComponent
        total={total}
        currentPage={currentPage}
        limit={limit}
        isShowPagination={total > limit}
        searchQuery={query}
        activeTag={tag}
        activeCategory={category}
      />
    </>
  );
}

export default page;
