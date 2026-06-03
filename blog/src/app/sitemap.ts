import { MetadataRoute } from 'next';
import { defaultLocale, host, locales } from '@/config';
import { getPathname } from '@/navigation';
import { Locale } from '@/i18n/request';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogs: { id: string; updatedAt: Date }[] = [];
  let tags: { name: string }[] = [];
  let categories: { name: string }[] = [];

  try {
    [blogs, tags, categories] = await Promise.all([
      prisma.blog.findMany({
        where: { published: true, deletedAt: null },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.tag.findMany({
        where: { deletedAt: null, blogs: { some: { published: true, deletedAt: null } } },
        select: { name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.category.findMany({
        where: { deletedAt: null, blogs: { some: { published: true, deletedAt: null } } },
        select: { name: true },
        orderBy: { name: 'asc' },
      }),
    ]);
  } catch (error) {
    logger.warn('Sitemap: could not fetch dynamic entries', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return [
    getEntry('/'),
    getEntry('/blog'),
    getEntry('/about-me'),
    getEntry('/project'),
    getEntry('/faq'),
    getEntry('/contact'),
    ...blogs.map((blog) =>
      getEntry({ pathname: '/blog/[id]', params: { id: blog.id } })
    ),
    ...tags.map((tag) =>
      getEntry({ pathname: '/blog/tag/[name]', params: { name: tag.name } })
    ),
    ...categories.map((category) =>
      getEntry({
        pathname: '/blog/category/[name]',
        params: { name: category.name },
      })
    ),
  ];
}

type Href = Parameters<typeof getPathname>[0]['href'];

function getEntry(href: Href) {
  return {
    url: getUrl(href, defaultLocale),
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, getUrl(href, locale)])
      ),
    },
  };
}

function getUrl(href: Href, locale: Locale) {
  const pathname = getPathname({ locale, href });
  return `${host}/${locale}${pathname === '/' ? '' : pathname}`;
}
