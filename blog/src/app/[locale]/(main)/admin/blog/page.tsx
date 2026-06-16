import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminBlogList from './_features/AdminBlogList';
import { auth } from '@/auth';
import { getAdminBlogsPaginated } from '@/lib/data/blogs';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import {
  canDeleteAnyBlog,
  canPublishBlog,
  hasUserPermission,
} from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBlogPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    !hasUserPermission(
      session.user.permissions,
      PERMISSIONS['blog:admin-list'],
      session.user.email
    )
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  const t = await getTranslations('Admin.Blog');
  const initialResult = await getAdminBlogsPaginated(
    locale,
    1,
    DEFAULT_PAGE_SIZE
  );

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminBlogList
        initialBlogs={initialResult.data}
        initialPagination={initialResult.pagination}
        initialStats={initialResult.stats}
        canPublish={canPublishBlog(
          session.user.permissions,
          session.user.email
        )}
        canDelete={canDeleteAnyBlog(
          session.user.permissions,
          session.user.email
        )}
      />
    </>
  );
}
