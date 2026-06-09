import {
  getMessages,
  getNow,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { CookieConsent } from '@/components/cookie-consent';
import InitialLoader from '@/components/loading/InitialLoader';
import { SiteAnalytics } from '@/components/site-analytics';
import { getMetadataBase } from '@/lib/page-metadata';
import { getSiteUrl } from '@/config';

type LocaleLayoutProps = Readonly<{
  children: ReactNode;
  authModal: ReactNode;
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const siteUrl = getSiteUrl();
  const description = `Tunahan İPEK - ${t('description')}`;

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: 'Tunahan İPEK',
      template: '%s | Tunahan İPEK',
    },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        tr: '/tr',
        en: '/en',
      },
    },
    openGraph: {
      title: 'Tunahan İPEK',
      description,
      type: 'website',
      locale: locale,
      siteName: 'Tunahan İPEK',
      alternateLocale: ['tr', 'en'],
      url: `${siteUrl}/${locale}`,
      images: [
        {
          url: '/opengraph-image',
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
        url: siteUrl,
      },
    ],
    category: 'technology',
    creator: 'Tunahan İPEK',
    generator: 'Next.js',
    twitter: {
      card: 'summary_large_image',
      site: '@tunahanipek',
      creator: '@tunahanipek',
      title: 'Tunahan İPEK',
      description,
      images: ['/opengraph-image'],
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
}: LocaleLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [messages, now] = await Promise.all([getMessages(), getNow()]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider messages={messages} locale={locale} now={now}>
        <InitialLoader>
          {children}
          <Toaster position="bottom-right" />
          <CookieConsent />
          <SiteAnalytics />
        </InitialLoader>
        {authModal}
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
