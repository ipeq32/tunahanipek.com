import { getTranslations } from "next-intl/server";

import { SiteContainer } from "@/app/_components/layout/SiteContainer";
import { site } from "@/app/_content/site";
import type { PublicResume } from "@/app/_lib/resume";
import { Link } from "@/navigation";

type FooterProps = {
  resume: PublicResume | null;
};

export default async function Footer({ resume }: FooterProps) {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  const resumeHref = resume?.url ?? site.social.linkedin;

  const links: Array<{
    key: "github" | "linkedin" | "twitter" | "resume";
    href: string;
    download?: string;
  }> = [
    { key: "github", href: site.social.github },
    { key: "linkedin", href: site.social.linkedin },
    { key: "twitter", href: site.social.twitter },
    {
      key: "resume",
      href: resumeHref,
      ...(resume ? { download: resume.fileName } : {}),
    },
  ];

  return (
    <footer className="mt-auto w-full border-t border-border py-10">
      <SiteContainer className="flex w-full flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="text-lg font-bold tracking-widest text-foreground"
          >
            {t("logo")}
          </Link>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {t("copyright", { year })}
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:w-auto sm:flex-wrap sm:gap-6">
          {links.map((link) => (
            <a
              key={link.key}
              href={link.href}
              {...(link.download ? { download: link.download } : {})}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
            >
              {t(link.key)}
            </a>
          ))}
        </div>
      </SiteContainer>
    </footer>
  );
}
