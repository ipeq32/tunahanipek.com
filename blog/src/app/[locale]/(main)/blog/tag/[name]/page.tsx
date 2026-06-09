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
  params: Promise<{ locale: string; name: string }>;
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
  const canonical = getCanonicalPath('/blog/tag/[name]', locale as 'en' | 'tr', {
    '[name]': encoded,
  });
  const languages = getLanguageAlternates('/blog/tag/[name]', {
    '[name]': encoded,
  });

  return {
    title: t('tagTitle', { name }),
    description: t('tagDescription', { name }),
    alternates: { canonical, languages },
    openGraph: {
      title: t('tagTitle', { name }),
      description: t('tagDescription', { name }),
      type: 'website',
      locale,
      url: canonical,
      images: ['/opengraph-image'],
    },
  };
}

export default async function BlogTagPage({ params, searchParams }: Props) {
  const { name: encoded, locale } = await params;
  const name = decodeURIComponent(encoded);
  const { page, q } = await searchParams;
  const search = q?.trim();
  const currentPage = parseInt(page || '1');
  const limit = 9;
  const t = await getTranslations('Blog.Taxonomy');

  const { data, total } = await getPublishedBlogs(currentPage, limit, {
    tag: name,
    search,
    locale,
  });

  return (
    <>
      <BlogBackLink />
      <HeaderTemplate
        title={t('tagTitle', { name })}
        description={t('tagDescription', { name })}
      />
      <TaxonomySearch scope="tag" name={name} initialQuery={search} />
      <BlogsFeature data={data} />
      <PaginationComponent
        total={total}
        currentPage={currentPage}
        limit={limit}
        isShowPagination={total > limit}
        activeTag={name}
        searchQuery={search}
      />
    </>
  );
}
