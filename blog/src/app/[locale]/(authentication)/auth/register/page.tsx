import FormPage from './_components/form';
import HeaderComponent from './_components/header';
import { isPublicRegistrationEnabled } from '@/lib/public-registration';
import { redirect } from '@/navigation';

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isPublicRegistrationEnabled()) {
    redirect({ href: '/auth/login', locale });
  }

  return (
    <section className="space-y-8">
      <HeaderComponent />
      <FormPage />
    </section>
  );
}
