import { PageLoading } from '@/components/layout/page-loading';
import { DidYouKnowShell } from '@/components/ui/did-you-know-shell';
import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const t = await getTranslations('A11y');

  return (
    <main className="mesh-background flex min-h-[50vh] flex-col items-center justify-center gap-6">
      <PageLoading ariaLabel={t('loading')} />
      <DidYouKnowShell variant="inline" className="max-w-md px-4 text-center" />
    </main>
  );
}
