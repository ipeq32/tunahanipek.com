import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminBlogList from './_features/AdminBlogList';
import { getAdminBlogs } from '@/lib/data/blogs';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('Admin.Blog');
  const initialBlogs = await getAdminBlogs(locale);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminBlogList initialBlogs={initialBlogs} />
    </>
  );
}
