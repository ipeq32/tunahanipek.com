import { ExternalLink } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteContainer } from "@/app/_components/layout/SiteContainer";
import { getBlogAboutUrl } from "@/app/_lib/blog-urls";
import type { Locale } from "@/config";

export default async function About() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("About");
  const paragraphs = t.raw("paragraphs") as string[];
  const aboutUrl = getBlogAboutUrl(locale);

  return (
    <section id="about" className="scroll-mt-20 py-12 lg:py-16">
      <SiteContainer>
        <div className="relative rounded-3xl border border-border bg-card p-8 shadow-lg sm:p-10 lg:p-12">
          <span className="absolute right-6 top-6 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            {t("badge")}
          </span>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t("title")}
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-accent" />
            </div>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              <p className="pt-2">
                <a
                  href={aboutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition hover:opacity-80"
                >
                  {t("readMore")}
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </p>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
