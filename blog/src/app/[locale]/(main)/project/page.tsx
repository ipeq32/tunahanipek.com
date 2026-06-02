import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { FeatureCard } from '@/components/layout/feature-card';
import { getTranslations } from 'next-intl/server';
import { BookOpen, Globe } from 'lucide-react';

export default async function ProjectPage() {
  const t = await getTranslations('Pages.Project');

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
    </>
  );
}
