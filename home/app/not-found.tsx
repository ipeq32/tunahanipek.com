import Link from "next/link";
import { site } from "@/app/_content/site";

const NotFound = () => {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-5 text-center">
      <p className="text-8xl font-bold text-emerald-600/20">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        Sayfa bulunamadı
      </h1>
      <p className="mt-3 text-slate-600">
        Aradığınız sayfa taşınmış veya kaldırılmış olabilir.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          Ana sayfa
        </Link>
        <Link
          href={site.blogUrl}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-300"
        >
          Blog
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
