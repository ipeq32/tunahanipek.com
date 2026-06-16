import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminUsersList from './_features/AdminUsersList';
import { auth } from '@/auth';
import { getAdminUsersDto } from '@/lib/data/users';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';
import { isSuperAdmin } from '@/lib/auth-roles';
import { isPrimarySuperAdmin } from '@/lib/admin/users/primary-super-admin';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return redirect({ href: '/auth/login', locale });
  }

  const currentUserId = session.user.id;
  const canManage = isPrimarySuperAdmin(session.user.email);
  const t = await getTranslations('Admin.Users');
  const initialUsers = await getAdminUsersDto();

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminUsersList
        initialUsers={initialUsers}
        currentUserId={currentUserId}
        canManage={canManage}
      />
    </>
  );
}
