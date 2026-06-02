import { getLocale } from 'next-intl/server';

import AuthenticationLayout from './AuthenticationLayoutClient';
import { parseLocale } from '@/i18n/request';

type Props = {
  children: React.ReactNode;
};

export default async function AuthenticationLayoutPage({ children }: Props) {
  const locale = parseLocale(await getLocale());

  return <AuthenticationLayout locale={locale}>{children}</AuthenticationLayout>;
}
