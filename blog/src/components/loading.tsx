import { PageLoading } from '@/components/layout/page-loading';
import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const t = await getTranslations('A11y');
  return <PageLoading ariaLabel={t('loading')} variant="inline" />;
}
