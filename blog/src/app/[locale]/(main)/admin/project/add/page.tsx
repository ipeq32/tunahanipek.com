import HeaderTemplate from '@/components/templates/HeaderTemplate';
import ProjectForm from '@/components/project/ProjectForm';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AddProjectPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations('Admin.Project');

  if (!session?.user || !isSuperAdmin(session.user.role)) {
    redirect({ href: '/auth/login', locale });
  }

  return (
    <>
      <HeaderTemplate title={t('addTitle')} description={t('description')} />
      <ProjectForm
        mode="create"
        defaultValues={{
          title: '',
          url: '',
          image: '',
          description: '',
          published: false,
        }}
      />
    </>
  );
}
