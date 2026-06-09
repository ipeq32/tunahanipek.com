import { defineRouting } from "next-intl/routing";

export const defaultLocale = "tr" as const;
export const locales = ["tr", "en"] as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export type Locale = (typeof locales)[number];
