import Image from "next/image";
import { site } from "@/app/_content/site";
import ContactBar from "./ContactBar";
import SiteFooter from "./SiteFooter";

const Body = () => {
  const bioText = site.bio.join(" ");

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto md:overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
      </div>

      <div className="home-compact mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col px-4 py-8 sm:px-5 md:max-w-5xl md:justify-between md:py-5 lg:max-w-6xl">
        <div className="flex min-h-0 flex-1 flex-col gap-8 md:grid md:grid-cols-[minmax(0,13rem)_1fr] md:items-center md:gap-x-10 md:gap-y-0 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-x-12">
          <section className="flex shrink-0 flex-col items-center text-center md:items-start md:text-left">
            <div className="relative mb-5 md:mb-4">
              <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-br from-emerald-400/30 to-sky-400/30 blur-md" />
              <Image
                src={site.profileImage}
                alt={`${site.name} profil fotoğrafı`}
                width={160}
                height={160}
                priority
                className="relative h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg ring-1 ring-slate-200/80 sm:h-32 sm:w-32 md:h-24 md:w-24 lg:h-28 lg:w-28"
              />
            </div>

            <p className="text-xs font-medium uppercase tracking-widest text-emerald-700 sm:text-sm">
              {site.role}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-2xl lg:text-3xl">
              {site.name}
            </h1>
            <p className="mt-2 max-w-xs text-base text-slate-600 sm:text-lg md:mt-1.5 md:max-w-none md:text-sm lg:text-base">
              {site.tagline}
            </p>
          </section>

          <section className="min-h-0 text-center md:text-left">
            <div className="space-y-4 text-base leading-relaxed text-slate-600 md:hidden">
              {site.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="home-bio hidden text-sm leading-relaxed text-slate-600 md:block lg:text-[0.9375rem] lg:leading-6">
              {bioText}
            </p>
          </section>
        </div>

        <div className="mt-8 shrink-0 space-y-5 md:mt-4 md:space-y-4">
          <ContactBar />
          <SiteFooter />
        </div>
      </div>
    </main>
  );
};

export default Body;
