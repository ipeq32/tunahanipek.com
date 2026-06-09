import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminProjectList from './_features/AdminProjectList';
import { getAdminProjects } from '@/lib/data/projects';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminProjectPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('Admin.Project');
  const initialProjects = await getAdminProjects(locale);

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminProjectList initialProjects={initialProjects} />
    </>
  );
}
