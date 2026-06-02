import HeaderTemplate from '@/components/templates/HeaderTemplate';
import ForgotPasswordForm from './_components/ForgotPasswordForm';
import { getTranslations } from 'next-intl/server';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('Auth.ForgotPassword');

  return (
    <section className="h-[calc(100vh-250px)] flex flex-col items-center md:justify-center gap-6">
      <HeaderTemplate title={t('title')} description={t('description')} />
      <ForgotPasswordForm />
    </section>
  );
}
