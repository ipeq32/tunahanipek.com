import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminCommentsList from './_features/AdminCommentsList';
import { auth } from '@/auth';
import { getPendingCommentsPaginated } from '@/lib/data/comments';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCommentsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    !hasUserPermission(
      session.user.permissions,
      PERMISSIONS['comment:moderate'],
      session.user.email
    )
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  const t = await getTranslations('Admin.Comments');
  const initialResult = await getPendingCommentsPaginated(1, DEFAULT_PAGE_SIZE);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminCommentsList
        initialComments={initialResult.data}
        initialPagination={initialResult.pagination}
      />
    </>
  );
}
