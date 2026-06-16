import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminUsersList from './_features/AdminUsersList';
import { auth } from '@/auth';
import { getAccessRolesDto } from '@/lib/data/access-roles';
import { getAdminUsersDto } from '@/lib/data/users';
import { hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';
import { isPrimarySuperAdmin } from '@/lib/admin/users/primary-super-admin';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    !hasUserPermission(
      session.user.permissions,
      PERMISSIONS['user:read'],
      session.user.email
    )
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  const currentUserId = session.user.id;
  const canManage = isPrimarySuperAdmin(session.user.email);
  const t = await getTranslations('Admin.Users');
  const [initialUsers, initialRoles] = await Promise.all([
    getAdminUsersDto(),
    getAccessRolesDto(),
  ]);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminUsersList
        initialUsers={initialUsers}
        initialRoles={initialRoles}
        currentUserId={currentUserId}
        canManage={canManage}
      />
    </>
  );
}
