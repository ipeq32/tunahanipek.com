import { getSiteUrl } from '@/config';
import { SOCIAL_LINKS } from '@/lib/social';

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildWebSiteJsonLd(locale: string) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tunahan İPEK',
    url: `${siteUrl}/${locale}`,
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
  };
}

export function buildPersonJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Tunahan İPEK',
    url: siteUrl,
    sameAs: [
      SOCIAL_LINKS.linkedin,
      SOCIAL_LINKS.github,
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.twitter,
    ],
  };
}

export function buildArticleJsonLd(params: {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  datePublished?: Date | string;
  dateModified?: Date | string;
}) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/${params.locale}${params.path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url,
    image: params.image ?? `${siteUrl}/opengraph-image`,
    datePublished: params.datePublished
      ? new Date(params.datePublished).toISOString()
      : undefined,
    dateModified: params.dateModified
      ? new Date(params.dateModified).toISOString()
      : undefined,
    author: {
      '@type': 'Person',
      name: 'Tunahan İPEK',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Tunahan İPEK',
    },
  };
}

export function buildCreativeWorkJsonLd(params: {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  url?: string | null;
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${params.locale}${params.path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: params.title,
    description: params.description,
    url: pageUrl,
    image: params.image ?? `${siteUrl}/opengraph-image`,
    ...(params.url ? { sameAs: params.url } : {}),
  };
}
