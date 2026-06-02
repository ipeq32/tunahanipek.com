import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import NextLink from 'next/link';

export default async function ProjectPage() {
  const t = await getTranslations('Pages.Project');

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="p-4 border rounded-lg dark:border-slate-700">
          <h2 className="font-semibold">{t('portfolio.title')}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t('portfolio.description')}
          </p>
          <NextLink
            href="https://tunahanipek.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-teal-600 dark:text-teal-400 mt-3 inline-block hover:underline"
          >
            tunahanipek.com
          </NextLink>
        </article>
        <article className="p-4 border rounded-lg dark:border-slate-700">
          <h2 className="font-semibold">{t('blog.title')}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t('blog.description')}
          </p>
          <Link
            href="/blog"
            className="text-sm text-teal-600 dark:text-teal-400 mt-3 inline-block hover:underline"
          >
            {t('blog.link')}
          </Link>
        </article>
      </div>
    </>
  );
}
