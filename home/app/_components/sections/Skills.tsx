import { getTranslations } from "next-intl/server";

import { site } from "@/app/_content/site";

export default async function Skills() {
  const t = await getTranslations("Skills");

  return (
    <section className="py-12 lg:py-16">
      <div className="section-container">
        <div className="text-center">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {site.skills.map((skill) => (
            <div key={skill.name} className="skill-card">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm"
                style={{ backgroundColor: skill.color }}
                aria-hidden
              >
                {skill.name.charAt(0)}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
