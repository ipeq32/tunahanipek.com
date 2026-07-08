import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteContainer } from "@/app/_components/layout/SiteContainer";
import ResumeDownloadButton from "@/app/_components/resume/ResumeDownloadButton";
import { site } from "@/app/_content/site";
import { getBlogProjectsUrl } from "@/app/_lib/blog-urls";
import type { PublicResume } from "@/app/_lib/resume";
import type { Locale } from "@/config";

type HeroProps = {
  resume: PublicResume | null;
};

export default async function Hero({ resume }: HeroProps) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Hero");
  const projectsUrl = getBlogProjectsUrl(locale);

  return (
    <section id="home" className="scroll-mt-20 py-16 lg:py-24">
      <SiteContainer>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="animate-fade-in-up order-2 lg:order-1">
          <p className="eyebrow text-accent">{t("eyebrow")}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("name")}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">
            {t("rolePrefix")}{" "}
            <span className="text-accent">{t("roleHighlight")}</span>
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ResumeDownloadButton resume={resume} />
            <a
              href={projectsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <ExternalLink className="h-4 w-4" />
              {t("viewProjects")}
            </a>
          </div>
        </div>

        <div className="relative order-1 flex justify-center lg:order-2">
          <div className="relative w-full max-w-sm">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/20 to-blue-400/10 blur-2xl" />
            <div className="relative rotate-2 rounded-3xl border border-border bg-card p-2 shadow-2xl transition hover:rotate-0">
              <Image
                src={site.profileImage}
                alt={t("name")}
                width={480}
                height={560}
                priority
                className="aspect-[4/5] w-full rounded-2xl object-cover"
              />
            </div>
            <span className="availability-badge absolute -bottom-3 left-4 rounded-full px-4 py-1.5 text-xs font-semibold shadow-md">
              {t("badge")}
            </span>
          </div>
        </div>
      </div>
      </SiteContainer>
    </section>
  );
}
