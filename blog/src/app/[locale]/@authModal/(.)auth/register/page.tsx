import { isPublicRegistrationEnabled } from '@/lib/public-registration';
import { redirect } from '@/navigation';
import RegisterModalClient from './RegisterModalClient';

export default async function RegisterModal({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isPublicRegistrationEnabled()) {
    redirect({ href: '/auth/login', locale });
  }

  return <RegisterModalClient />;
}
