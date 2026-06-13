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
import { ActiveLanguagesProvider } from '@/components/providers/active-languages-provider';
import { AuthSessionProvider } from '@/components/providers/auth-session-provider';
import { AuthUserProvider } from '@/components/providers/auth-user-provider';
import { getSession } from '@/lib/cached-session';
import { getMetadataBase } from '@/lib/page-metadata';
import { getActiveLanguages } from '@/lib/languages';

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
  const [locale, messages, session, languages] = await Promise.all([
    getLocale(),
    getMessages(),
    getSession(),
    getActiveLanguages(),
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} flex min-h-dvh flex-col font-sans`}
        suppressHydrationWarning
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <NextIntlClientProvider
          locale={locale}
          messages={pick(messages, 'Error')}
        >
          <AuthSessionProvider session={session}>
            <AuthUserProvider session={session}>
              <ActiveLanguagesProvider languages={languages}>
                {children}
              </ActiveLanguagesProvider>
            </AuthUserProvider>
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
