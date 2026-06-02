import HeaderTemplate from '@/components/templates/HeaderTemplate';
import ResetPasswordForm from './_components/ResetPasswordForm';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export default async function ResetPasswordPage() {
  const t = await getTranslations('Auth.ResetPassword');

  return (
    <section className="h-[calc(100vh-250px)] flex flex-col items-center md:justify-center gap-6">
      <HeaderTemplate title={t('title')} description={t('description')} />
      <Suspense fallback={<p className="text-sm">{t('loading')}</p>}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
