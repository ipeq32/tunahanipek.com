import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { FeatureCard } from '@/components/layout/feature-card';
import { ContentCard } from '@/components/layout/content-card';
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
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">{t('dbTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ContentCard key={project.id} className="flex flex-col gap-3">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="flex-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
                {project.url && (
                  <NextLink
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
                  >
                    {t('visit')}
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </NextLink>
                )}
              </ContentCard>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
