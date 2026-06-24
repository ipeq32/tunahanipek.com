import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { auth } from '@/auth';
import {
  getWebhookDashboardStats,
  listWebhookEvents,
  listWebhookSources,
} from '@/lib/data/webhooks';
import { isPrimarySuperAdmin } from '@/lib/admin/users/primary-super-admin';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';
import WebhookMonitorDashboard from './_features/WebhookMonitorDashboard';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminWebhooksPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    return redirect({ href: '/auth/login', locale });
  }

  if (!isPrimarySuperAdmin(session.user.email)) {
    return redirect({ href: '/', locale });
  }

  const t = await getTranslations('Admin.Webhooks');
  const [sources, stats, eventsResult] = await Promise.all([
    listWebhookSources(),
    getWebhookDashboardStats(),
    listWebhookEvents({ page: 1, pageSize: DEFAULT_PAGE_SIZE }),
  ]);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <WebhookMonitorDashboard
        initialSources={sources}
        initialStats={stats}
        initialEvents={eventsResult.data}
        initialPagination={eventsResult.pagination}
      />
    </>
  );
}
