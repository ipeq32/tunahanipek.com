import { getTranslations } from "next-intl/server";

import { SiteContainer } from "@/app/_components/layout/SiteContainer";

type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  description: string;
};

export default async function Experience() {
  const t = await getTranslations("Experience");
  const items = t.raw("items") as ExperienceItem[];

  return (
    <section id="experience" className="scroll-mt-20 py-12 lg:py-16">
      <SiteContainer>
        <div className="text-center">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.company}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-accent/30 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {item.period}
              </p>
              <h3 className="mt-2 text-lg font-bold text-foreground">
                {item.company}
              </h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {item.role}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
