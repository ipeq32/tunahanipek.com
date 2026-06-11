import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { FeatureCard } from '@/components/layout/feature-card';
import BlogImage from '@/components/blog/BlogImage';
import ProjectCard from '@/components/project/ProjectCard';
import { Link } from '@/navigation';
import { getPublishedProjects } from '@/lib/data/projects';
import type { ProjectDto } from '@/lib/project-mapper';
import { stripHtmlText } from '@/lib/translation-form-utils';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Pages.Project' });
  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    route: '/project',
  });
}
import { ArrowUpRight, BookOpen, FolderGit2, Globe } from 'lucide-react';

function FeaturedProject({
  project,
  label,
  visitLabel,
}: {
  project: ProjectDto;
  label: string;
  visitLabel: string;
}) {
  return (
    <Link
      href={{ pathname: '/project/[id]', params: { id: project.id } }}
      className="block h-full"
    >
      <article className="group relative grid h-full overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 lg:grid-cols-2">
        <div className="relative aspect-[2/1] overflow-hidden sm:aspect-[16/10] lg:aspect-auto lg:min-h-[340px]">
          <BlogImage
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur">
            <FolderGit2 className="h-3.5 w-3.5" />
            {label}
          </span>
        </div>
        <div className="flex flex-col justify-center gap-4 p-7 md:p-9">
          <h3 className="text-2xl font-bold leading-tight tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400">
            {project.title}
          </h3>
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {stripHtmlText(project.description)}
          </p>
          {project.url && (
            <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-600 transition-colors group-hover:bg-teal-500/20 dark:text-teal-400">
              {visitLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Pages.Project');
  const projects = await getPublishedProjects(locale);

  const [featured, ...rest] = projects;
  const hasProjects = projects.length > 0;

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />

      {hasProjects ? (
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                {t('eyebrow')}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t('worksTitle')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('worksSubtitle')}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <FolderGit2 className="h-3.5 w-3.5" />
              {t('countLabel', { count: projects.length })}
            </span>
          </div>

          <FeaturedProject
            project={featured}
            label={t('featured')}
            visitLabel={t('visit')}
          />

          {rest.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  visitLabel={t('visit')}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/40 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        </section>
      )}

      <section className="mt-12 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            {t('linksTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('linksSubtitle')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            title={t('portfolio.title')}
            description={t('portfolio.description')}
            href="https://tunahanipek.com"
            linkLabel="tunahanipek.com"
            icon={Globe}
            external
          />
          <FeatureCard
            title={t('blog.title')}
            description={t('blog.description')}
            internalHref="/blog"
            linkLabel={t('blog.link')}
            icon={BookOpen}
          />
        </div>
      </section>
    </>
  );
}
