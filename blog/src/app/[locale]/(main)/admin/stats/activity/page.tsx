import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { auth } from '@/auth';
import { canAccessAdminPanel } from '@/lib/auth-roles';
import { getAiUsageLogsPaginated } from '@/lib/data/admin-stats';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';
import AdminAiActivityList from '@/components/admin/AdminAiActivityList';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAiActivityPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    !canAccessAdminPanel(session.user.permissions, session.user.email)
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  const t = await getTranslations('Admin.Stats');
  const initialResult = await getAiUsageLogsPaginated(1, DEFAULT_PAGE_SIZE);

  return (
    <>
      <HeaderTemplate
        title={t('activity.title')}
        description={t('activity.description')}
      />
      <AdminAiActivityList
        initialLogs={initialResult.data}
        initialPagination={initialResult.pagination}
      />
    </>
  );
}
