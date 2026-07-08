import type { Locale } from "@/config";

/**
 * Blog sayfa yolları — blog/src/routes.ts ile senkron tutulmalı.
 * Yeni locale eklendiğinde TypeScript eksik path'leri burada işaretler.
 */
export const blogPathnames = {
  "/": {
    en: "/",
    tr: "/",
  },
  "/blog": {
    en: "/blog",
    tr: "/blog",
  },
  "/project": {
    en: "/project",
    tr: "/proje",
  },
  "/about-me": {
    en: "/about-me",
    tr: "/hakkimda",
  },
  "/contact": {
    en: "/contact",
    tr: "/iletisim",
  },
} as const satisfies Record<string, Record<Locale, string>>;

export type BlogPathname = keyof typeof blogPathnames;
