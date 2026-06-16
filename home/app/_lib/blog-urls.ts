import { site } from "@/app/_content/site";
import type { Locale } from "@/config";

export function getBlogApiBase(): string {
  const internal = process.env.BLOG_INTERNAL_API_URL?.replace(/\/$/, "");
  if (internal) {
    return internal;
  }

  const base =
    process.env.BLOG_API_URL ??
    process.env.NEXT_PUBLIC_BLOG_URL ??
    site.blogUrl;

  return base.replace(/\/$/, "");
}

export function getBlogContactUrl(locale: Locale): string {
  const blogBase = getBlogApiBase();

  return locale === "tr"
    ? `${blogBase}/tr/iletisim`
    : `${blogBase}/en/contact`;
}
