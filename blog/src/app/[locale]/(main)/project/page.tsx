import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { FeatureCard } from '@/components/layout/feature-card';
import BlogImage from '@/components/blog/BlogImage';
import { getPublishedProjects } from '@/lib/data/projects';
import { getTranslations } from 'next-intl/server';
import { BookOpen, ExternalLink, Globe } from 'lucide-react';
import NextLink from 'next/link';

export default async function ProjectPage() {
  const t = await getTranslations('Pages.Project');
  const projects = await getPublishedProjects();

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <div className="mt-2 grid gap-6 md:grid-cols-2">
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

      {projects.length > 0 && (
        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold tracking-tight">
            {t('dbTitle')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const card = (
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
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="text-lg font-semibold leading-snug tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400">
                      {project.title}
                    </h3>
                    <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    {project.url && (
                      <span className="mt-1 inline-flex items-center text-sm font-medium text-teal-600 dark:text-teal-400">
                        {t('visit')}
                        <ExternalLink className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    )}
                  </div>
                </article>
              );

              return project.url ? (
                <NextLink
                  key={project.id}
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block h-full"
                >
                  {card}
                </NextLink>
              ) : (
                <div key={project.id} className="h-full">
                  {card}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
