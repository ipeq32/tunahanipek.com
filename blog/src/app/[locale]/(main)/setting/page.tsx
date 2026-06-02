import HeaderTemplate from '@/components/templates/HeaderTemplate';
import SettingsForm from './_features/SettingsForm';
import { auth } from '@/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/navigation';

export default async function SettingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations('Settings');

  if (!session?.user) {
    redirect({ href: '/auth/login?callback=/setting', locale });
  }

  const { user } = session;

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <SettingsForm
        initialUser={{
          name: user.name ?? '',
          phone: user.phone ?? '',
          address: user.address ?? '',
          website: user.website ?? '',
          image: user.image ?? '',
          bio: user.bio ?? '',
        }}
      />
    </>
  );
}
