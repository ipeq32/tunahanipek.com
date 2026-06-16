import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminProjectList from './_features/AdminProjectList';
import { auth } from '@/auth';
import { getAdminProjectsPaginated } from '@/lib/data/projects';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { canPublishProject, hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminProjectPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    !hasUserPermission(
      session.user.permissions,
      PERMISSIONS['project:admin-list'],
      session.user.email
    )
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  const t = await getTranslations('Admin.Project');
  const initialResult = await getAdminProjectsPaginated(
    locale,
    1,
    DEFAULT_PAGE_SIZE
  );

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminProjectList
        initialProjects={initialResult.data}
        initialPagination={initialResult.pagination}
        initialStats={initialResult.stats}
        canPublish={canPublishProject(
          session.user.permissions,
          session.user.email
        )}
        canDelete={hasUserPermission(
          session.user.permissions,
          PERMISSIONS['project:delete'],
          session.user.email
        )}
      />
    </>
  );
}
