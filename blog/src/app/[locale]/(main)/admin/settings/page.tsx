import HeaderTemplate from '@/components/templates/HeaderTemplate';
import ResumeSettingsForm from './_features/ResumeSettingsForm';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSettingsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations('Admin.Settings');

  if (!session?.user || !isSuperAdmin(session.user.role)) {
    redirect({ href: '/auth/login', locale });
  }

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <ResumeSettingsForm />
    </>
  );
}
