import { site } from "@/app/_content/site";
import type { Locale } from "@/config";

function getBlogBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_BLOG_URL ??
    process.env.BLOG_API_URL ??
    site.blogUrl;

  return base.replace(/\/$/, "");
}

export function getBlogContactUrl(locale: Locale): string {
  const blogBase = getBlogBaseUrl();

  return locale === "tr"
    ? `${blogBase}/tr/iletisim`
    : `${blogBase}/en/contact`;
}
