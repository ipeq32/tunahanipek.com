import './globals.css';
import 'react-quill-new/dist/quill.snow.css';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import pick from 'lodash/pick';
import { locales } from '@/config';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

type Props = {
  children: ReactNode;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children }: Props) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
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
