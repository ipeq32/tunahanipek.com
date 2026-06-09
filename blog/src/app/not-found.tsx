import Link from 'next/link';
import { defaultLocale } from '@/config';

export default function NotFound() {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body
        className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-6 text-center text-zinc-100"
        suppressHydrationWarning
      >
        <p className="text-6xl font-bold text-teal-400">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Sayfa bulunamadı</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          Page not found. Aradığınız sayfa taşınmış veya kaldırılmış olabilir.
        </p>
        <Link
          href={`/${defaultLocale}`}
          className="mt-8 rounded-full bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500"
        >
          Ana sayfaya dön
        </Link>
      </body>
    </html>
  );
}
