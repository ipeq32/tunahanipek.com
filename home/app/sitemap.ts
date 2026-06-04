import type { MetadataRoute } from "next";

import { locales } from "@/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tunahanipek.com";

  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${baseUrl}/${l}`]),
      ),
    },
  }));
}
