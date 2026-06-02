import Link from "next/link";
import { site } from "@/app/_content/site";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-md md:static">
      <nav
        className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-5 md:h-12"
        aria-label="Ana menü"
      >
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-slate-900 transition-colors hover:text-emerald-700 md:text-sm"
        >
          {site.name}
        </Link>
        <Link
          href={site.blogUrl}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 md:px-3 md:py-1 md:text-xs"
        >
          Blog
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
