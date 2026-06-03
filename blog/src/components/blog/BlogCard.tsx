'use client';

import BlogImage from '@/components/blog/BlogImage';
import { Link } from '@/navigation';
import { IGetBlog } from '@/types/blog';
import { useFormatter, useNow } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';

type BlogCardProps = {
  blog: IGetBlog;
};

export default function BlogCard({ blog }: BlogCardProps) {
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const updatedAt = new Date(blog.updatedAt);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10">
      <Link
        href={{ pathname: '/blog/[id]', params: { id: blog.id } }}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <BlogImage
          src={blog.shortImage}
          alt={blog.title}
          width={640}
          height={400}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-lg transition-all group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{blog.author.name}</span>
          <time dateTime={updatedAt.toISOString()} suppressHydrationWarning>
            {format.relativeTime(updatedAt, now)}
          </time>
        </div>

        <h2 className="text-lg font-semibold leading-snug tracking-tight">
          <Link
            href={{ pathname: '/blog/[id]', params: { id: blog.id } }}
            className="hover:text-teal-600 dark:hover:text-teal-400"
          >
            {blog.title}
          </Link>
        </h2>

        <div
          className="line-clamp-2 text-sm text-muted-foreground [&_p]:inline"
          dangerouslySetInnerHTML={{ __html: blog.summary }}
        />

        {(blog.tags.length > 0 || blog.categories.length > 0) && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {blog.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="accent" className="text-[10px]">
                #{tag}
              </Badge>
            ))}
            {blog.categories.slice(0, 1).map((cat) => (
              <Badge key={cat} variant="outline" className="text-[10px]">
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
