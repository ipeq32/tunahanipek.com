import { EmptyState } from '@/components/layout/empty-state';
import { getTranslations } from 'next-intl/server';
import { DatabaseZap } from 'lucide-react';

export async function ContentUnavailableNotice() {
  const t = await getTranslations('Service.Unavailable');

  return (
    <div className="mt-8">
      <EmptyState
        title={t('title')}
        description={t('description')}
        icon={DatabaseZap}
      />
    </div>
  );
}
