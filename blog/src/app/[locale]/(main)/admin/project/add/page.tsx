import HeaderTemplate from '@/components/templates/HeaderTemplate';
import ProjectForm from '@/components/project/ProjectForm';
import { auth } from '@/auth';
import { hasUserPermission, canPublishProject } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AddProjectPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations('Admin.Project');

  if (
    !session?.user ||
    !hasUserPermission(
      session.user.permissions,
      PERMISSIONS['project:create'],
      session.user.email
    )
  ) {
    redirect({ href: '/auth/login', locale });
  }

  return (
    <>
      <HeaderTemplate title={t('addTitle')} description={t('description')} />
      <ProjectForm
        mode="create"
        canPublish={canPublishProject(
          session.user.permissions,
          session.user.email
        )}
        defaultValues={{
          url: '',
          image: '',
          gallery: [],
        }}
      />
    </>
  );
}
