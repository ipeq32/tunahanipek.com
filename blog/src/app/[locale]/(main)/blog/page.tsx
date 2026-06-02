import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogsFeature from './_features/Blogs';
import PaginationComponent from '@/components/pagination';
import BlogSearch from '@/components/blog/BlogSearch';
import { getPublishedBlogs } from '@/lib/data/blogs';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export const revalidate = 60;

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
  }>;
};

async function page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1');
  const limit = parseInt(resolvedSearchParams.limit || '9');
  const query = resolvedSearchParams.q;
  const t = await getTranslations('Blog');

  const { data: blogData, total } = await getPublishedBlogs(
    currentPage,
    limit,
    query
  );

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <Suspense fallback={null}>
        <BlogSearch />
      </Suspense>
      <BlogsFeature data={blogData} />
      <PaginationComponent
        total={total}
        currentPage={currentPage}
        limit={limit}
        isShowPagination={total > limit}
        searchQuery={query}
      />
    </>
  );
}

export default page;
