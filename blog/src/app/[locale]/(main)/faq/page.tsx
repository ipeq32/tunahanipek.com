import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { FaqAccordion } from '@/components/layout/faq-accordion';
import { getTranslations } from 'next-intl/server';

export default async function FaqPage() {
  const t = await getTranslations('Pages.Faq');
  const keys = ['q1', 'q2', 'q3'] as const;

  const items = keys.map((key) => ({
    id: key,
    question: t(`${key}.question`),
    answer: t(`${key}.answer`),
  }));

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <div className="mt-2">
        <FaqAccordion items={items} />
      </div>
    </>
  );
}
