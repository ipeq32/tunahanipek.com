import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminRolesEditor from './_features/AdminRolesEditor';
import { auth } from '@/auth';
import { getAccessRolesPaginated } from '@/lib/data/access-roles';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminRolesPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    !hasUserPermission(
      session.user.permissions,
      PERMISSIONS['role:read'],
      session.user.email
    )
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  const t = await getTranslations('Admin.Roles');
  const initialResult = await getAccessRolesPaginated(1, DEFAULT_PAGE_SIZE);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminRolesEditor
        initialRoles={initialResult.data}
        initialPagination={initialResult.pagination}
      />
    </>
  );
}
