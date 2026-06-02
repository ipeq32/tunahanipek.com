import HeaderTemplate from '@/components/templates/HeaderTemplate';
import SettingsForm from './_features/SettingsForm';
import { getTranslations } from 'next-intl/server';

export default async function SettingPage() {
  const t = await getTranslations('Settings');

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <SettingsForm />
    </>
  );
}
