import BlogImage from '@/components/blog/BlogImage';
import { Link } from '@/navigation';
import { getPublishedProjectById } from '@/lib/data/projects';
import { parseLocale } from '@/i18n/request';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { buildCreativeWorkJsonLd } from '@/lib/json-ld';
import {
  getCanonicalPath,
  getLanguageAlternates,
  getLocalizedPathname,
} from '@/lib/localized-path';
import NextLink from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [project, t] = await Promise.all([
    getPublishedProjectById(id),
    getTranslations('Pages.Project'),
  ]);

  if (!project) {
    return { title: t('notFoundTitle') };
  }

  const locale = parseLocale(await getLocale());
  const plainDescription = project.description
    .replace(/<[^>]*>/g, '')
    .slice(0, 160);
  const images = project.image ? [project.image] : [];
  const canonical = getCanonicalPath('/project/[id]', locale, { '[id]': id });
  const languages = getLanguageAlternates('/project/[id]', { '[id]': id });

  return {
    title: project.title,
    description: plainDescription,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: project.title,
      description: plainDescription,
      type: 'article',
      locale,
      url: canonical,
      images,
    },
    twitter: {
      card: project.image ? 'summary_large_image' : 'summary',
      title: project.title,
      description: plainDescription,
      images,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const locale = parseLocale(await getLocale());
  const [project, t] = await Promise.all([
    getPublishedProjectById(id),
    getTranslations('Pages.Project'),
  ]);

  if (!project) {
    notFound();
  }

  const projectPath = getLocalizedPathname('/project/[id]', locale, {
    '[id]': id,
  });
  const plainDescription = project.description
    .replace(/<[^>]*>/g, '')
    .slice(0, 160);

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd
        data={buildCreativeWorkJsonLd({
          locale,
          path: projectPath,
          title: project.title,
          description: plainDescription,
          image: project.image,
          url: project.url,
        })}
      />
      <Link
        href="/project"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-teal-600 dark:hover:text-teal-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('back')}
      </Link>

      {project.image && (
        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
          <BlogImage
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {project.title}
      </h1>

      {project.url && (
        <NextLink
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-500/20 dark:text-teal-400"
        >
          {t('visitSite')}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </NextLink>
      )}

      <h2 className="mt-8 text-lg font-semibold tracking-tight">
        {t('aboutTitle')}
      </h2>
      <div
        className="prose prose-neutral mt-3 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: project.description }}
      />
    </article>
  );
}
