import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminProjectList from './_features/AdminProjectList';
import { auth } from '@/auth';
import { getAdminProjects } from '@/lib/data/projects';
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
  const initialProjects = await getAdminProjects(locale);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminProjectList
        initialProjects={initialProjects}
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
