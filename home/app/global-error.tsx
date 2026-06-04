"use client";

import "./globals.css";

import { useEffect } from "react";

const COPY = {
  tr: {
    title: "Kritik bir hata oluştu",
    description: "Uygulama beklenmedik şekilde durdu. Lütfen tekrar deneyin.",
    retry: "Tekrar dene",
    home: "Ana sayfa",
  },
  en: {
    title: "A critical error occurred",
    description: "The application stopped unexpectedly. Please try again.",
    retry: "Try again",
    home: "Home",
  },
} as const;

type LocaleKey = keyof typeof COPY;

function resolveLocale(): LocaleKey {
  if (typeof document === "undefined") {
    return "tr";
  }
  const lang = document.documentElement.lang?.toLowerCase() ?? "";
  return lang.startsWith("en") ? "en" : "tr";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = resolveLocale();
  const t = COPY[locale];

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 text-center">
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            {t.description}
          </p>
          {process.env.NODE_ENV === "development" && error.digest ? (
            <p className="mt-2 font-mono text-xs text-slate-500">
              {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              {t.retry}
            </button>
            <a
              href={`/${locale}`}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold dark:border-slate-700"
            >
              {t.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
