import { getTranslations } from "next-intl/server";

export default async function About() {
  const t = await getTranslations("About");
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <section id="about" className="scroll-mt-20 py-12 lg:py-16">
      <div className="section-container">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
