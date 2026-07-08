import { site } from "@/app/_content/site";
import { blogPathnames, type BlogPathname } from "@/app/_lib/blog-pathnames";
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

export function getBlogPageUrl(locale: Locale, pathname: BlogPathname): string {
  const blogBase = getBlogApiBase();
  const path = blogPathnames[pathname][locale];

  return `${blogBase}/${locale}${path}`;
}

export function getBlogHomeUrl(locale: Locale): string {
  return getBlogPageUrl(locale, "/");
}

export function getBlogListingUrl(locale: Locale): string {
  return getBlogPageUrl(locale, "/blog");
}

export function getBlogProjectsUrl(locale: Locale): string {
  return getBlogPageUrl(locale, "/project");
}

export function getBlogContactUrl(locale: Locale): string {
  return getBlogPageUrl(locale, "/contact");
}

export function getBlogAboutUrl(locale: Locale): string {
  return getBlogPageUrl(locale, "/about-me");
}
