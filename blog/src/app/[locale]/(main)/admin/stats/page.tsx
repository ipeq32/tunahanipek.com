import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { auth } from '@/auth';
import { canAccessAdminPanel } from '@/lib/auth-roles';
import { getAdminDashboardStats } from '@/lib/data/admin-stats';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';
import AdminStatsDashboard from './_features/AdminStatsDashboard';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminStatsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    !canAccessAdminPanel(session.user.permissions, session.user.email)
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  const t = await getTranslations('Admin.Stats');
  const stats = await getAdminDashboardStats(locale);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminStatsDashboard initialStats={stats} />
    </>
  );
}
