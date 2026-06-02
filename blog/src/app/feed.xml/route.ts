import type { Prisma } from '@prisma/client';
import { host } from '@/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const feedBlogInclude = {
  author: { select: { name: true } },
} as const satisfies Prisma.BlogInclude;

type FeedBlogRow = Prisma.BlogGetPayload<{
  include: typeof feedBlogInclude;
}>;

function buildRssItem(blog: FeedBlogRow): string {
  const link = `${host}/tr/blog/${blog.id}`;
  const description = blog.summary.replace(/<[^>]*>/g, '');
  return `
    <item>
      <title><![CDATA[${blog.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tunahan İpek Blog</title>
    <link>${host}</link>
    <description>Blog yazıları</description>
    <language>tr</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
