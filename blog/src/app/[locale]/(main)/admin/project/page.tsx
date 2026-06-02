import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AdminProjectList from './_features/AdminProjectList';
import { getAdminProjects } from '@/lib/data/projects';
import { getTranslations } from 'next-intl/server';

export default async function AdminProjectPage() {
  const t = await getTranslations('Admin.Project');
  const initialProjects = await getAdminProjects();

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AdminProjectList initialProjects={initialProjects} />
    </>
  );
}
