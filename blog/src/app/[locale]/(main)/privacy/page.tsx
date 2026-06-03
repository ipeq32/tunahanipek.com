import { LegalDocument } from '@/components/legal/legal-document';
import {
  PRIVACY_SECTION_ICONS,
  PRIVACY_SECTION_KEYS,
} from '@/components/legal/legal-section-config';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Legal.Privacy' });
  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    route: '/privacy',
  });
}

export default async function PrivacyPage() {
  const [t, shared] = await Promise.all([
    getTranslations('Legal.Privacy'),
    getTranslations('Legal.Shared'),
  ]);

  const sections = PRIVACY_SECTION_KEYS.map((key) => ({
    key,
    title: t(`sections.${key}.title`),
    body: t(`sections.${key}.body`),
    icon: PRIVACY_SECTION_ICONS[key],
  }));

  return (
    <LegalDocument
      variant="privacy"
      title={t('title')}
      description={t('description')}
      badge={t('badge')}
      lastUpdatedLabel={shared('lastUpdatedLabel')}
      lastUpdated={t('lastUpdated')}
      tocTitle={shared('tocTitle')}
      sections={sections}
      questionsTitle={shared('questionsTitle')}
      questionsDescription={shared('questionsDescription')}
      contactCta={shared('contactCta')}
      relatedTitle={shared('relatedTitle')}
      relatedDescription={t('relatedDescription')}
      relatedHref="/terms"
      relatedLabel={shared('termsLink')}
    />
  );
}
