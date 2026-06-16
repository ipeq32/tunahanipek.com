import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminCommentsList from './_features/AdminCommentsList';
import { auth } from '@/auth';
import { getPendingCommentsDto } from '@/lib/data/comments';
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
  const initialComments = await getPendingCommentsDto();

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminCommentsList initialComments={initialComments} />
    </>
  );
}
