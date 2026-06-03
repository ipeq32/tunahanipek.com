import HeaderTemplate from '@/components/templates/HeaderTemplate';
import ProjectForm from '@/components/project/ProjectForm';
import { getAdminProjectById } from '@/lib/data/projects';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
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

  if (!session?.user || !isSuperAdmin(session.user.role)) {
    redirect({ href: '/auth/login', locale });
  }

  const project = await getAdminProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <>
      <HeaderTemplate title={t('editTitle')} description={t('description')} />
      <ProjectForm
        mode="edit"
        projectId={id}
        defaultValues={{
          title: project.title,
          url: project.url ?? '',
          image: project.image ?? '',
          description: project.description,
          published: project.published,
        }}
      />
    </>
  );
}
