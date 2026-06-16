import 'server-only';

import { unstable_cache } from 'next/cache';

import { searchNominatim } from '@/lib/address/nominatim';
import type { SiteOwnerProfile } from '@/lib/site-owner';
import {
  buildGeocodeQuery,
  resolveContactMapLocation,
  type ContactMapLocation,
} from './location';

async function geocodeQuery(
  query: string
): Promise<{ lat: number; lon: number } | null> {
  const results = await searchNominatim(query, 1);
  const first = results[0];

  if (!first || !Number.isFinite(first.lat) || !Number.isFinite(first.lon)) {
    return null;
  }

  return { lat: first.lat, lon: first.lon };
}

const getCachedGeocode = unstable_cache(
  geocodeQuery,
  ['contact-map-geocode'],
  { revalidate: 86_400 }
);

export async function getContactMapLocation(
  owner: SiteOwnerProfile | null
): Promise<ContactMapLocation | null> {
  const direct = resolveContactMapLocation(owner);
  if (direct) {
    return direct;
  }

  if (!owner) {
    return null;
  }

  const addressLabel = owner.addressShort?.trim();
  const mapsHref = owner.mapsHref;

  if (!addressLabel || !mapsHref) {
    return null;
  }

  const query = buildGeocodeQuery(owner);
  if (!query) {
    return null;
  }

  try {
    const coords = await getCachedGeocode(query);
    if (!coords) {
      return null;
    }

    return {
      latitude: coords.lat,
      longitude: coords.lon,
      addressLabel,
      mapsHref,
      approximate: true,
    };
  } catch {
    return null;
  }
}
