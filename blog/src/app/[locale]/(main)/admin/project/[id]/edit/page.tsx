import HeaderTemplate from '@/components/templates/HeaderTemplate';
import ProjectForm from '@/components/project/ProjectForm';
import { getAdminProjectById } from '@/lib/data/projects';
import { auth } from '@/auth';
import { hasUserPermission, canPublishProject } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { notFound } from 'next/navigation';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function EditProjectPage({ params }: Props) {
  const { id, locale } = await params;
  const session = await auth();
  const t = await getTranslations('Admin.Project');

  if (
    !session?.user ||
    !hasUserPermission(
      session.user.permissions,
      PERMISSIONS['project:update'],
      session.user.email
    )
  ) {
    return redirect({ href: '/auth/login', locale });
  }

  const { user } = session;
  const project = await getAdminProjectById(id, locale);

  if (!project) {
    notFound();
  }

  return (
    <>
      <HeaderTemplate title={t('editTitle')} description={t('description')} />
      <ProjectForm
        mode="edit"
        projectId={id}
        canPublish={canPublishProject(user.permissions, user.email)}
        defaultValues={{
          url: project.url ?? '',
          image: project.image ?? '',
          gallery: project.gallery ?? [],
          translations: project.translations,
        }}
      />
    </>
  );
}
