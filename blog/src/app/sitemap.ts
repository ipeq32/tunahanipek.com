import { MetadataRoute } from 'next';
import { defaultLocale, host, locales } from '@/config';
import { getPathname } from '@/navigation';
import { Locale } from '@/i18n/request';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogs: { id: string; updatedAt: Date }[] = [];

  try {
    blogs = await prisma.blog.findMany({
    where: { published: true, deletedAt: null },
    select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (error) {
    logger.warn('Sitemap: could not fetch blogs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return [
    getEntry('/'),
    getEntry('/blog'),
    ...blogs.map((blog) =>
      getEntry({ pathname: '/blog/[id]', params: { id: blog.id } })
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
