import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminBlogList from './_features/AdminBlogList';
import { getAdminBlogs } from '@/lib/data/blogs';
import { getTranslations } from 'next-intl/server';

export default async function AdminBlogPage() {
  const t = await getTranslations('Admin.Blog');
  const initialBlogs = await getAdminBlogs();

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminBlogList initialBlogs={initialBlogs} />
    </>
  );
}
