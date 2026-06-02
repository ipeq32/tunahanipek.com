import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { getTranslations } from 'next-intl/server';

export default async function AboutPage() {
  const t = await getTranslations('Pages.About');

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <div className="mt-8 prose dark:prose-invert max-w-none">
        <p>{t('body')}</p>
      </div>
    </>
  );
}
