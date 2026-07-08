import { getBlogHomeUrl } from "@/app/_lib/blog-urls";
import { defaultLocale } from "@/config";

export default function NotFound() {
  const blogUrl = getBlogHomeUrl(defaultLocale);
  return (
    <html lang={defaultLocale}>
      <body className="min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 text-center">
          <p className="text-8xl font-bold text-blue-500/20">404</p>
          <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            The page you are looking for may have been moved or removed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`/${defaultLocale}`}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Home
            </a>
            <a
              href={blogUrl}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold dark:border-slate-700"
            >
              Blog
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
