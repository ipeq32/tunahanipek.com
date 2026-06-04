import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { SiteContainer } from "@/app/_components/layout/SiteContainer";
import { site } from "@/app/_content/site";

export default async function Skills() {
  const t = await getTranslations("Skills");

  return (
    <section className="py-12 lg:py-16">
      <SiteContainer>
        <div className="text-center">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {site.skills.map((skill) => (
            <div key={skill.name} className="skill-card">
              <span className="skill-card-icon" aria-hidden>
                <Image
                  src={skill.icon}
                  alt=""
                  width={40}
                  height={40}
                  className="h-9 w-9 object-contain"
                />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
