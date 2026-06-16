import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AddBlogFeature from './_features/AddBlog';
import { auth } from '@/auth';
import { hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations('Blog.Add');

  if (
    !session?.user ||
    !hasUserPermission(
      session.user.permissions,
      PERMISSIONS['blog:create'],
      session.user.email
    )
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AddBlogFeature />
    </>
  );
}
