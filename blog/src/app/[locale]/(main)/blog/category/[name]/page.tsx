import BlogBackLink from '@/components/blog/BlogBackLink';
import HeaderTemplate from '@/components/templates/HeaderTemplate';
import BlogsFeature from '../../_features/Blogs';
import PaginationComponent from '@/components/pagination';
import TaxonomySearch from '@/components/blog/TaxonomySearch';
import { getPublishedBlogs } from '@/lib/data/blogs';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import {
  getCanonicalPath,
  getLanguageAlternates,
} from '@/lib/localized-path';

export const revalidate = 60;

type Props = {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; name: string }>;
}): Promise<Metadata> {
  const { locale, name: encoded } = await params;
  const name = decodeURIComponent(encoded);
  const t = await getTranslations({ locale, namespace: 'Blog.Taxonomy' });
  const canonical = getCanonicalPath(
    '/blog/category/[name]',
    locale as 'en' | 'tr',
    { '[name]': encoded },
  );
  const languages = getLanguageAlternates('/blog/category/[name]', {
    '[name]': encoded,
  });

  return {
    title: t('categoryTitle', { name }),
    description: t('categoryDescription', { name }),
    alternates: { canonical, languages },
    openGraph: {
      title: t('categoryTitle', { name }),
      description: t('categoryDescription', { name }),
      type: 'website',
      locale,
      url: canonical,
      images: ['/opengraph-image'],
    },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: Props) {
  const { name: encoded } = await params;
  const name = decodeURIComponent(encoded);
  const { page, q } = await searchParams;
  const search = q?.trim();
  const currentPage = parseInt(page || '1');
  const limit = 9;
  const t = await getTranslations('Blog.Taxonomy');

  const { data, total } = await getPublishedBlogs(currentPage, limit, {
    category: name,
    search,
  });

  return (
    <>
      <BlogBackLink />
      <HeaderTemplate
        title={t('categoryTitle', { name })}
        description={t('categoryDescription', { name })}
      />
      <TaxonomySearch scope="category" name={name} initialQuery={search} />
      <BlogsFeature data={data} />
      <PaginationComponent
        total={total}
        currentPage={currentPage}
        limit={limit}
        isShowPagination={total > limit}
        activeCategory={name}
        searchQuery={search}
      />
    </>
  );
}
