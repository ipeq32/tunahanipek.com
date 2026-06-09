import "../globals.css";

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";

import InitialLoader from "@/app/_components/Loading/InitialLoader";
import Navbar from "@/app/_components/Navigation/Navbar";
import { ThemeProvider } from "@/app/_components/providers/ThemeProvider";
import { site } from "@/app/_content/site";
import { locales, type Locale } from "@/config";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-playfair",
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const localeMap: Record<Locale, string> = {
    en: "en_US",
    tr: "tr_TR",
  };

  return {
    metadataBase: new URL("https://tunahanipek.com"),
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
    openGraph: {
      type: "profile",
      locale: localeMap[locale as Locale] ?? "en_US",
      url: `https://tunahanipek.com/${locale}`,
      emails: site.emails.map((e) => e.address),
      images: [
        {
          url: site.openGraphImage,
          width: 512,
          height: 512,
          alt: site.name,
        },
      ],
      title: t("title"),
      description: t("description"),
      countryName: "Turkey",
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [site.openGraphImage],
    },
    authors: [{ name: site.name, url: "https://tunahanipek.com" }],
    creator: site.name,
    alternates: {
      canonical: `https://tunahanipek.com/${locale}`,
      languages: {
        en: "https://tunahanipek.com/en",
        tr: "https://tunahanipek.com/tr",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} flex min-h-dvh flex-col antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <InitialLoader>
              <Navbar />
              {children}
            </InitialLoader>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
