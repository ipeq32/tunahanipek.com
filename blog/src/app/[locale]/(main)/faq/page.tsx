import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { getTranslations } from 'next-intl/server';

export default async function FaqPage() {
  const t = await getTranslations('Pages.Faq');
  const items = ['q1', 'q2', 'q3'] as const;

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <dl className="mt-8 space-y-6">
        {items.map((key) => (
          <div key={key}>
            <dt className="font-semibold">{t(`${key}.question`)}</dt>
            <dd className="mt-1 text-muted-foreground">{t(`${key}.answer`)}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
