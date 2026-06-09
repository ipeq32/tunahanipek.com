import type { Prisma } from '@prisma/client';
import { defaultLocale, getSiteUrl } from '@/config';
import { prisma } from '@/lib/prisma';
import { getActiveLanguages } from '@/lib/languages';

export const dynamic = 'force-dynamic';

const feedBlogInclude = {
  author: { select: { name: true } },
  translations: {
    where: { published: true },
    include: { language: { select: { code: true } } },
  },
} as const satisfies Prisma.BlogInclude;

type FeedBlogRow = Prisma.BlogGetPayload<{
  include: typeof feedBlogInclude;
}>;

function blogLink(id: string, locale: string): string {
  return `${getSiteUrl()}/${locale}/blog/${id}`;
}

function pickTranslation(blog: FeedBlogRow, locale: string) {
  return (
    blog.translations.find((t) => t.language.code === locale) ??
    blog.translations.find((t) => t.language.code === defaultLocale) ??
    blog.translations[0]
  );
}

function buildRssItem(blog: FeedBlogRow, locale: string): string | null {
  const translation = pickTranslation(blog, locale);
  if (!translation) {
    return null;
  }

  const canonical = blogLink(blog.id, locale);
  const description = translation.summary.replace(/<[^>]*>/g, '');
  const alternates = blog.translations
    .map(
      (item) =>
        `<xhtml:link rel="alternate" hreflang="${item.language.code}" href="${blogLink(blog.id, item.language.code)}" />`,
    )
    .join('');

  return `
    <item>
      <title><![CDATA[${translation.title}]]></title>
      <link>${canonical}</link>
      <guid isPermaLink="true">${canonical}</guid>
      ${alternates}
      <pubDate>${blog.createdAt.toUTCString()}</pubDate>
      <description><![CDATA[${description}]]></description>
      <author>${blog.author?.name ?? 'Anonim'}</author>
    </item>`;
}

export async function GET() {
  const languages = await getActiveLanguages();
  const locale = languages.find((l) => l.isDefault)?.code ?? defaultLocale;

  const blogs: FeedBlogRow[] = await prisma.blog.findMany({
    where: {
      deletedAt: null,
      translations: {
        some: {
          published: true,
          language: { code: locale, isActive: true },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: feedBlogInclude,
  });

  const items = blogs
    .map((blog) => buildRssItem(blog, locale))
    .filter((item): item is string => item !== null)
    .join('');

  const siteUrl = getSiteUrl();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <channel>
    <title>Tunahan İPEK Blog</title>
    <link>${siteUrl}/${locale}/blog</link>
    <description>Latest blog posts</description>
    <language>${locale}</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
