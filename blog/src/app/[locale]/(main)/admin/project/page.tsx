import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { ContentCard } from '@/components/layout/content-card';
import { getTranslations } from 'next-intl/server';
import { FolderKanban } from 'lucide-react';

export default async function AdminProjectPage() {
  const t = await getTranslations('Admin.Project');

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <ContentCard className="mt-2 flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <FolderKanban className="h-7 w-7" />
        </div>
        <p className="max-w-md text-muted-foreground">{t('comingSoon')}</p>
      </ContentCard>
    </>
  );
}
