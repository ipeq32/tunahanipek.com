import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { FeatureCard } from '@/components/layout/feature-card';
import BlogImage from '@/components/blog/BlogImage';
import { getPublishedProjects } from '@/lib/data/projects';
import type { ProjectDto } from '@/lib/project-mapper';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, BookOpen, FolderGit2, Globe } from 'lucide-react';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

type ProjectLinkProps = {
  url: string | null;
  children: ReactNode;
};

function ProjectLink({ url, children }: ProjectLinkProps) {
  if (!url) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <NextLink
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block h-full"
    >
      {children}
    </NextLink>
  );
}

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
    <ProjectLink url={project.url}>
      <article className="group relative grid h-full overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 lg:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[340px]">
          <BlogImage
            src={project.image}
            alt={project.title}
            fill
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
          <div
            className="line-clamp-4 text-sm leading-relaxed text-muted-foreground [&_p]:inline"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
          {project.url && (
            <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-600 transition-colors group-hover:bg-teal-500/20 dark:text-teal-400">
              {visitLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          )}
        </div>
      </article>
    </ProjectLink>
  );
}

function ProjectCard({
  project,
  visitLabel,
}: {
  project: ProjectDto;
  visitLabel: string;
}) {
  return (
    <ProjectLink url={project.url}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10">
        <div className="relative aspect-[16/10] overflow-hidden">
          <BlogImage
            src={project.image}
            alt={project.title}
            width={640}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          {project.url && (
            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-lg transition-all group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-lg font-semibold leading-snug tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400">
            {project.title}
          </h3>
          <div
            className="line-clamp-3 flex-1 text-sm text-muted-foreground [&_p]:inline"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
          {project.url && (
            <span className="mt-1 inline-flex items-center text-sm font-medium text-teal-600 dark:text-teal-400">
              {visitLabel}
              <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          )}
        </div>
      </article>
    </ProjectLink>
  );
}

export default async function ProjectPage() {
  const t = await getTranslations('Pages.Project');
  const projects = await getPublishedProjects();

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
