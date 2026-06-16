import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminSiteCopyEditor from './_features/AdminSiteCopyEditor';
import { auth } from '@/auth';
import { locales } from '@/config';
import { hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { getAllSiteSnippetsForAdmin, repairSiteSnippets } from '@/lib/site-snippets';
import { getDefaultSnippetsByLocale } from '@/lib/site-snippets/defaults';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSiteCopyPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    !hasUserPermission(
      session.user.permissions,
      PERMISSIONS['site-copy:read'],
      session.user.email
    )
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  const t = await getTranslations('Admin.SiteCopy');
  const fallbackByLocale = getDefaultSnippetsByLocale();

  await repairSiteSnippets();

  const initialDataByLocale = Object.fromEntries(
    await Promise.all(
      locales.map(async (code) => {
        const [tips, mottos] = await Promise.all([
          getAllSiteSnippetsForAdmin(code, 'TIP'),
          getAllSiteSnippetsForAdmin(code, 'FOOTER_MOTTO'),
        ]);

        return [code, { tips, mottos }] as const;
      })
    )
  );

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminSiteCopyEditor
        initialLocale={locale}
        initialDataByLocale={initialDataByLocale}
        fallbackByLocale={fallbackByLocale}
      />
    </>
  );
}
