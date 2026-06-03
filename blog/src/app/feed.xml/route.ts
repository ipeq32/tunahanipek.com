import type { Prisma } from '@prisma/client';
import { defaultLocale, host, locales } from '@/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const feedBlogInclude = {
  author: { select: { name: true } },
} as const satisfies Prisma.BlogInclude;

type FeedBlogRow = Prisma.BlogGetPayload<{
  include: typeof feedBlogInclude;
}>;

function blogLink(id: string, locale: string): string {
  return `${host}/${locale}/blog/${id}`;
}

function buildRssItem(blog: FeedBlogRow): string {
  const canonical = blogLink(blog.id, defaultLocale);
  const description = blog.summary.replace(/<[^>]*>/g, '');
  const alternates = locales
    .map(
      (locale) =>
        `<xhtml:link rel="alternate" hreflang="${locale}" href="${blogLink(blog.id, locale)}" />`
    )
    .join('');

  return `
    <item>
      <title><![CDATA[${blog.title}]]></title>
      <link>${canonical}</link>
      <guid isPermaLink="true">${canonical}</guid>
      ${alternates}
      <pubDate>${blog.createdAt.toUTCString()}</pubDate>
      <description><![CDATA[${description}]]></description>
      <author>${blog.author?.name ?? 'Anonim'}</author>
    </item>`;
}

export async function GET() {
  const blogs: FeedBlogRow[] = await prisma.blog.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: feedBlogInclude,
  });

  const items = blogs.map(buildRssItem).join('');
  const feedUrl = `${host}/feed.xml`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <channel>
    <title>Tunahan İpek Blog</title>
    <link>${host}/${defaultLocale}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>Blog yazıları</description>
    <language>${defaultLocale}</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
