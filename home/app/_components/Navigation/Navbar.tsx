"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { site } from "@/app/_content/site";
import { ToggleLanguage } from "@/app/_components/controls/ToggleLanguage";
import { ToggleTheme } from "@/app/_components/controls/ToggleTheme";
import { NavbarLogo } from "./NavbarLogo";

const CONTACT_SECTION = "#contact";

type NavItem =
  | {
      key: "home" | "about" | "experience" | "contact";
      href: string;
      external?: false;
    }
  | { key: "blog"; href: string; external: true };

export default function Navbar() {
  const t = useTranslations("Navbar");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(
    () => [
      { key: "home", href: "#home" },
      { key: "about", href: "#about" },
      { key: "experience", href: "#experience" },
      { key: "blog", href: site.blogUrl, external: true },
      { key: "contact", href: CONTACT_SECTION },
    ],
    [],
  );

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="section-container flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <NavbarLogo label={t("logoAria")} wordmark={t("wordmark")} />

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label={t("menuAria")}
        >
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
              >
                {t(item.key)}
              </a>
            ) : (
              <a
                key={item.key}
                href={item.href}
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
              >
                {t(item.key)}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            <ToggleLanguage />
            <ToggleTheme />
          </div>
          <a href={CONTACT_SECTION} className="btn-dark hidden sm:inline-flex">
            {t("hireMe")}
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={t("menuAria")}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav
            className="section-container flex flex-col gap-1 py-4"
            aria-label={t("menuAria")}
          >
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(item.key)}
                </a>
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(item.key)}
                </a>
              ),
            )}
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-4">
              <ToggleLanguage />
              <ToggleTheme />
            </div>
            <a
              href={CONTACT_SECTION}
              className="btn-dark mt-3 inline-flex"
              onClick={() => setMobileOpen(false)}
            >
              {t("hireMe")}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
