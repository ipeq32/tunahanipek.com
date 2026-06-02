import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminBlogList from './_features/AdminBlogList';

export default function AdminBlogPage() {
  return (
    <>
      <HeaderTemplate
        title="Blog Yönetimi"
        description="Yazıları onaylayın, yayınlayın veya silin."
      />
      <AdminBlogList />
    </>
  );
}
