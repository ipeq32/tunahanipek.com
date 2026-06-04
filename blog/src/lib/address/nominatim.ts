import { logAddressUpstreamError } from './fetch-utils';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'tunahanipek-blog/1.0 (address-picker; contact@tunahanipek.com)';

export type NominatimAddressDetails = {
  house_number?: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  province?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
};

export type NominatimPlace = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddressDetails;
};

export type GeocodeResult = {
  placeId: number;
  lat: number;
  lon: number;
  displayName: string;
  address?: NominatimAddressDetails;
};

async function nominatimFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${NOMINATIM_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function normalizeNominatimPlace(raw: NominatimPlace): GeocodeResult {
  return {
    placeId: raw.place_id,
    lat: Number(raw.lat),
    lon: Number(raw.lon),
    displayName: raw.display_name,
    address: raw.address,
  };
}

export async function searchNominatim(
  query: string,
  limit = 5
): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  try {
    const results = await nominatimFetch<NominatimPlace[]>('/search', {
      q: trimmed,
      format: 'json',
      addressdetails: '1',
      limit: String(limit),
    });
    return (Array.isArray(results) ? results : []).map(normalizeNominatimPlace);
  } catch (error) {
    logAddressUpstreamError('Nominatim search', error, { query: trimmed });
    throw error;
  }
}

export async function reverseNominatim(
  lat: number,
  lon: number
): Promise<GeocodeResult | null> {
  try {
    const result = await nominatimFetch<NominatimPlace>('/reverse', {
      lat: String(lat),
      lon: String(lon),
      format: 'json',
      addressdetails: '1',
    });
    if (!result?.lat) {
      return null;
    }
    return normalizeNominatimPlace(result);
  } catch (error) {
    logAddressUpstreamError('Nominatim reverse', error, { lat, lon });
    throw error;
  }
}
