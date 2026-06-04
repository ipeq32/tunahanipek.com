import './globals.css';

import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import pick from 'lodash/pick';
import { locales } from '@/config';
import { Inter } from 'next/font/google';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { extractRouterConfig } from 'uploadthing/server';
import { ourFileRouter } from '@/app/api/uploadthing/core';
import { getMetadataBase } from '@/lib/page-metadata';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
};

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
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
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
