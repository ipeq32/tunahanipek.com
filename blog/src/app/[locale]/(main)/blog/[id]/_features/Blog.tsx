'use client';

import { IGetBlog } from '@/types/blog';
import { useFormatter, useTranslations } from 'next-intl';
import NotfoundComponent from '../../_components/notfound';
import { LocaleFallbackBanner } from '@/components/locale-fallback-banner';
import BlogImage from '@/components/blog/BlogImage';
import Image from 'next/image';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';

type BlogFeatureProps = {
  data: IGetBlog;
};

const BlogFeature = ({ data: blogData }: BlogFeatureProps) => {
  const format = useFormatter();
  const t = useTranslations('Blog');

  const data = blogData.published ? blogData : null;

  if (!data) {
    return <NotfoundComponent />;
  }

  return (
    <article className="pb-16 pt-4">
      {data.isLocaleFallback && (
        <LocaleFallbackBanner
          contentLocale={data.locale}
          namespace="Blog.LocaleFallback"
        />
      )}
      <header className="mb-8 space-y-6">
        {(data.tags.length > 0 || data.categories.length > 0) && (
          <div className="flex flex-wrap justify-center gap-2">
            {data.tags.map((tag) => (
              <Link
                key={tag}
                href={{ pathname: '/blog/tag/[name]', params: { name: tag } }}
              >
                <Badge variant="accent">#{tag}</Badge>
              </Link>
            ))}
            {data.categories.map((cat) => (
              <Link
                key={cat}
                href={{ pathname: '/blog/category/[name]', params: { name: cat } }}
              >
                <Badge variant="outline">{cat}</Badge>
              </Link>
            ))}
          </div>
        )}

        <h1 className="text-center text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {data.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Image
              src={
                data.author.image ||
                'https://img.icons8.com/?size=100&id=21441&format=png&color=000000'
              }
              alt={data.author.name}
              width={28}
              height={28}
              unoptimized
              className="h-7 w-7 rounded-full ring-2 ring-border"
            />
            <User className="h-4 w-4 md:hidden" />
            <span className="font-medium text-foreground">
              {data.author.name}
              <span className="font-normal text-muted-foreground">
                {' '}
                ·{' '}
                {data.author.role === 'SUPER_ADMIN'
                  ? t('roleAdmin')
                  : t('roleAuthor')}
              </span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={new Date(data.createdAt).toISOString()}>
              {format.dateTime(new Date(data.createdAt), {
                dateStyle: 'long',
              })}
            </time>
          </span>
        </div>
      </header>

      <figure className="mb-10 overflow-hidden rounded-2xl border border-border/60 shadow-lg">
        <BlogImage
          src={data.image}
          alt={data.title}
          width={1200}
          height={560}
          className="aspect-[21/9] w-full object-cover"
          priority
        />
      </figure>

      <div
        className="prose-blog"
        dangerouslySetInnerHTML={{
          __html: data.content,
        }}
      />
    </article>
  );
};

export default BlogFeature;
