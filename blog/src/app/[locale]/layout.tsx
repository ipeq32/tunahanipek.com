import {
  getMessages,
  getNow,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthSessionProvider } from '@/components/providers/auth-session-provider';
import { Toaster } from '@/components/ui/sonner';
import { auth } from '@/auth';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: {
      default: 'Tunahan İPEK',
      template: '%s | Tunahan İPEK',
    },
    description: `Tunahan İPEK - ${t('description')}`,
    alternates: {
      canonical: '/',
      languages: {
        tr: '/tr',
        en: '/en',
      },
    },
    openGraph: {
      title: 'Tunahan İPEK',
      description: `Tunahan İPEK - ${t('description')}`,
      type: 'website',
      locale: locale,
      siteName: 'Tunahan İPEK',
      alternateLocale: ['tr', 'en'],
      url: 'https://tunahanipek.com',
      images: [
        {
          url: 'https://tunahanipek.com/logo.png',
          width: 1200,
          height: 630,
          alt: 'Tunahan İPEK',
        },
      ],
    },
    appleWebApp: {
      title: 'Tunahan İPEK',
      capable: true,
      statusBarStyle: 'black',
    },
    applicationName: 'Tunahan İPEK',
    authors: [
      {
        name: 'Tunahan İPEK',
        url: 'https://tunahanipek.com',
      },
    ],
    category: 'Travel',
    creator: 'Tunahan İPEK',
    generator: 'Tunahan İPEK',
    icons: [
      {
        sizes: '64x64',
        type: 'image/x-icon',
        url: '/favicon.ico',
        host: 'tunahanipek.com',
        protocol: 'https',
        origin: 'https://tunahanipek.com',
      },
    ],
    twitter: {
      card: 'summary',
      site: '@tunahanipek',
      creator: '@tunahanipek',
      title: 'Tunahan İPEK',
      description: `Tunahan İPEK - ${t('description')}`,
      images: [
        {
          url: 'https://tunahanipek.com/logo.png',
          width: 1200,
          height: 630,
          alt: 'Tunahan İPEK',
        },
      ],
    },
    robots: {
      googleBot: {
        index: true,
        follow: true,
      },
      follow: true,
      index: true,
    },
    publisher: 'Tunahan İPEK',
    keywords: [
      'Tunahan İPEK',
      'Tunahan',
      'İPEK',
      'tunahanipek',
      'tunahan',
      'ipek',
      'tunahanipek.com',
    ],
  };
}

export default async function LocaleLayout({
  children,
  authModal,
  params,
}: Readonly<{
  children: React.ReactNode;
  authModal: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [messages, session, now] = await Promise.all([
    getMessages(),
    auth(),
    getNow(),
  ]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider messages={messages} locale={locale} now={now}>
        <AuthSessionProvider session={session}>
          {children}
          {authModal}
          <Toaster position="bottom-right" />
        </AuthSessionProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
