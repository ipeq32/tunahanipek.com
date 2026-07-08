import { PageLoading } from '@/components/layout/page-loading';
import { DidYouKnowShell } from '@/components/ui/did-you-know-shell';
import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const t = await getTranslations('A11y');

  return (
    <div className="flex min-h-[min(100dvh-8rem,52rem)] flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <PageLoading ariaLabel={t('loading')} className="min-h-0 flex-none py-0" />
      <DidYouKnowShell variant="inline" className="max-w-md px-4 text-center" />
    </div>
  );
}
