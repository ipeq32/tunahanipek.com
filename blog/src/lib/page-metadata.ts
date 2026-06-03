import type { Metadata } from 'next';

import type { AppPathnames } from '@/config';
import { getSiteUrl } from '@/config';
import { getCanonicalPath } from '@/lib/localized-path';

type PageMetadataInput = {
  title: string;
  description: string;
  locale: string;
  route: AppPathnames;
};

export function buildPageMetadata({
  title,
  description,
  locale,
  route,
}: PageMetadataInput): Metadata {
  const canonical = getCanonicalPath(route, locale as 'en' | 'tr');

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      locale,
      url: canonical,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}
