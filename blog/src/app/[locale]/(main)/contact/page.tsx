import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';

export default async function ContactPage() {
  const t = await getTranslations('Pages.Contact');

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <div className="mt-8 space-y-4">
        <p>{t('body')}</p>
        <p>
          <span className="font-medium">{t('emailLabel')}:</span>{' '}
          <a
            href="mailto:hello@tunahanipek.com"
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            hello@tunahanipek.com
          </a>
        </p>
        <p>
          <NextLink
            href="https://github.com/ipeq32"
            target="_blank"
            rel="noreferrer"
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            GitHub
          </NextLink>
        </p>
      </div>
    </>
  );
}
