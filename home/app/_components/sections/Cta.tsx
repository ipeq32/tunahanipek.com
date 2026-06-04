import { getTranslations } from "next-intl/server";

import { site } from "@/app/_content/site";

export default async function Cta() {
  const t = await getTranslations("Cta");

  const socialLinks = [
    { key: "linkedin", href: site.social.linkedin },
    { key: "github", href: site.social.github },
    { key: "twitter", href: site.social.twitter },
    { key: "blog", href: site.blogUrl },
  ] as const;

  return (
    <section id="contact" className="scroll-mt-24 py-12 lg:scroll-mt-28 lg:py-16">
      <div className="section-container">
        <div className="rounded-3xl bg-foreground px-8 py-12 text-background sm:px-12 sm:py-16">
          <h2 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {t("titlePrefix")}{" "}
            <em className="font-serif italic text-sky-300">
              {t("titleHighlight")}
            </em>{" "}
            {t("titleSuffix")}
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {site.emails.map((email) => (
              <a
                key={email.address}
                href={`mailto:${email.address}`}
                className="rounded-xl border border-background/20 bg-background/5 px-5 py-4 transition hover:bg-background/10"
              >
                <span className="block text-xs font-semibold uppercase tracking-widest text-background/60">
                  {t(email.id)}
                </span>
                <span className="mt-1 block text-sm font-medium sm:text-base">
                  {email.address}
                </span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-6 border-t border-background/20 pt-8">
            {socialLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold uppercase tracking-widest text-background/80 transition hover:text-background"
              >
                {t(link.key)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
