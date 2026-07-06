import BlogImage from '@/components/blog/BlogImage';
import RichContentView from '@/components/content/RichContentView';
import ProjectGallery from '@/components/project/ProjectGallery';
import { LocaleFallbackBanner } from '@/components/locale-fallback-banner';
import { Link } from '@/navigation';
import { getPublishedProjectById } from '@/lib/data/projects';
import { parseLocale } from '@/i18n/request';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { buildCreativeWorkJsonLd } from '@/lib/json-ld';
import {
  getCanonicalPath,
  getLanguageAlternates,
  getLocalizedPathname,
} from '@/lib/localized-path';
import NextLink from 'next/link';
import { ArrowLeft, ArrowUpRight, ExternalLink, FolderGit2 } from 'lucide-react';

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale: localeParam } = await params;
  const locale = parseLocale(localeParam);
  const [project, t] = await Promise.all([
    getPublishedProjectById(id, locale),
    getTranslations({ locale, namespace: 'Pages.Project' }),
  ]);

  if (!project) {
    return { title: t('notFoundTitle') };
  }

  const plainDescription = project.description
    .replace(/<[^>]*>/g, '')
    .slice(0, 160);
  const images = [
    ...(project.image ? [project.image] : []),
    ...(project.gallery ?? []).filter((item) => item !== project.image),
  ];
  const canonical = getCanonicalPath('/project/[id]', locale, { '[id]': id });
  const languages = getLanguageAlternates(
    '/project/[id]',
    { '[id]': id },
    project.availableLocales,
  );

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
  const { id, locale: localeParam } = await params;
  const locale = parseLocale(localeParam);
  setRequestLocale(locale);
  const [project, t] = await Promise.all([
    getPublishedProjectById(id, locale),
    getTranslations({ locale, namespace: 'Pages.Project' }),
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
    <article key={`${locale}-${id}`} className="min-w-0 w-full max-w-full">
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
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-teal-500/30 hover:text-teal-600 dark:hover:text-teal-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('back')}
      </Link>

      {project.isLocaleFallback && (
        <LocaleFallbackBanner
          contentLocale={project.locale}
          namespace="Pages.Project.LocaleFallback"
          className="mb-6"
        />
      )}

      <header className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        {project.image ? (
          <div className="relative aspect-[2/1] max-h-56 w-full overflow-hidden sm:aspect-[21/9] sm:max-h-80">
            <BlogImage
              src={project.image}
              alt={project.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <FolderGit2 className="h-3.5 w-3.5" aria-hidden />
                {t('eyebrow')}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                {project.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="border-b border-border/60 px-6 py-8 sm:px-8">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
              <FolderGit2 className="h-3.5 w-3.5" aria-hidden />
              {t('eyebrow')}
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {project.title}
            </h1>
          </div>
        )}

        {project.url && (
          <div className="flex justify-end px-5 py-5 sm:px-7 sm:py-6">
            <NextLink
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              {t('visitSite')}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </NextLink>
          </div>
        )}
      </header>

      <section className="mt-8 rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {t('aboutTitle')}
          </h2>
        </div>
        <RichContentView html={project.description} />
      </section>

      <ProjectGallery images={project.gallery ?? []} title={project.title} />
    </article>
  );
}
