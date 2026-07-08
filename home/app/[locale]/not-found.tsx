import { getLocale, getTranslations } from "next-intl/server";

import { SiteContainer } from "@/app/_components/layout/SiteContainer";
import { getBlogHomeUrl } from "@/app/_lib/blog-urls";
import type { Locale } from "@/config";
import { Link } from "@/navigation";

export default async function LocaleNotFound() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("NotFound");
  const blogUrl = getBlogHomeUrl(locale);

  return (
    <SiteContainer
      as="main"
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <p className="text-8xl font-bold text-accent/20">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        {t("title")}
      </h1>
      <p className="mt-3 text-muted-foreground">{t("description")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-dark">
          {t("home")}
        </Link>
        <a href={blogUrl} className="btn-outline">
          {t("blog")}
        </a>
      </div>
    </SiteContainer>
  );
}
