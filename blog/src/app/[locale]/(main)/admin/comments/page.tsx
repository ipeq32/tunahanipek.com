import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminCommentsList from './_features/AdminCommentsList';
import { getTranslations } from 'next-intl/server';

export default async function AdminCommentsPage() {
  const t = await getTranslations('Admin.Comments');

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminCommentsList />
    </>
  );
}
