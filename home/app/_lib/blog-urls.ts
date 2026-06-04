import { site } from "@/app/_content/site";
import type { Locale } from "@/config";

export function getBlogContactUrl(locale: Locale): string {
  return locale === "tr"
    ? `${site.blogUrl}/tr/iletisim`
    : `${site.blogUrl}/en/contact`;
}
