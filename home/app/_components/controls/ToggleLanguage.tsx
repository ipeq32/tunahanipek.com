"use client";

import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { locales, type Locale } from "@/config";
import { usePathname, useRouter } from "@/navigation";

import { MenuItem, PopoverMenu } from "./PopoverMenu";

export function ToggleLanguage() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");

  function onSelect(value: Locale) {
    if (value === locale) return;
    router.replace(pathname, { locale: value });
  }

  return (
    <PopoverMenu
      label={t("label")}
      trigger={
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <Globe className="h-4 w-4" />
          <span className="uppercase tracking-wide">{locale}</span>
        </span>
      }
    >
      <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
        {t("label")}
      </p>
      {locales.map((cur) => {
        const isActive = cur === locale;
        return (
          <MenuItem
            key={cur}
            active={isActive}
            onSelect={() => onSelect(cur)}
          >
            <span className="flex-1">{t("locale", { locale: cur })}</span>
            {isActive ? <Check className="h-4 w-4 text-accent" /> : null}
          </MenuItem>
        );
      })}
    </PopoverMenu>
  );
}
