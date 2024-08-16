import './globals.css';

import { Chakra_Petch } from 'next/font/google';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import {
  getLocale,
  getMessages,
  unstable_setRequestLocale,
} from 'next-intl/server';
import pick from 'lodash/pick';
import { locales } from '@/config';

export const dynamic = 'force-dynamic';

type Props = {
  children: ReactNode;
};

const chackra = Chakra_Petch({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children }: Props) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  unstable_setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={chackra.className}>
        <NextIntlClientProvider
          locale={locale}
          messages={pick(messages, 'Error')}
        >
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
