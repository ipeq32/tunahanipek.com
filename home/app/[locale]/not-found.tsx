import { getTranslations } from "next-intl/server";

import { site } from "@/app/_content/site";
import { Link } from "@/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="section-container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-8xl font-bold text-accent/20">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        {t("title")}
      </h1>
      <p className="mt-3 text-muted-foreground">{t("description")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-dark">
          {t("home")}
        </Link>
        <a href={site.blogUrl} className="btn-outline">
          {t("blog")}
        </a>
      </div>
    </main>
  );
}
