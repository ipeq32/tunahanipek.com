import {
  extractArray,
  fetchJson,
  logAddressUpstreamError,
} from './fetch-utils';
import type { AddressOption } from './types';

const GEOCODED_API_BASE = 'https://api.geocoded.me';

type GeocodedCountry = {
  iso2: string;
  name: string;
};

type GeocodedState = {
  iso2: string;
  name: string;
};

type GeocodedCity = {
  name: string;
};

function buildGeocodedUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  const url = new URL(`${GEOCODED_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function getGeocodedCountries(): Promise<AddressOption[]> {
  try {
    const payload = await fetchJson<GeocodedCountry[] | { data: GeocodedCountry[] }>(
      buildGeocodedUrl('/countries', { fields: 'iso2,name', limit: 300 })
    );
    const items = extractArray<GeocodedCountry>(payload);
    return items
      .map((item) => ({
        id: item.iso2,
        label: item.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    logAddressUpstreamError('Geocoded countries', error);
    throw error;
  }
}

export async function getGeocodedStates(
  countryCode: string
): Promise<AddressOption[]> {
  try {
    const iso2 = countryCode.toUpperCase();
    const payload = await fetchJson<GeocodedState[] | { data: GeocodedState[] }>(
      buildGeocodedUrl(`/countries/${iso2}/states`, {
        fields: 'iso2,name',
        limit: 500,
      })
    );
    const items = extractArray<GeocodedState>(payload);
    return items
      .map((item) => ({
        id: item.iso2,
        label: item.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    logAddressUpstreamError('Geocoded states', error, { countryCode });
    throw error;
  }
}

export async function getGeocodedCities(
  countryCode: string,
  stateCode: string,
  name?: string
): Promise<AddressOption[]> {
  try {
    const iso2 = countryCode.toUpperCase();
    const state = stateCode.toUpperCase();
    const params: Record<string, string | number> = {
      fields: 'name',
      limit: name && name.trim().length >= 2 ? 50 : 500,
    };
    if (name && name.trim().length >= 2) {
      params.name = name.trim();
    }

    const payload = await fetchJson<GeocodedCity[] | { data: GeocodedCity[] }>(
      buildGeocodedUrl(`/countries/${iso2}/states/${state}/cities`, params)
    );
    const items = extractArray<GeocodedCity>(payload);
    return items
      .map((item) => ({
        id: item.name,
        label: item.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    logAddressUpstreamError('Geocoded cities', error, {
      countryCode,
      stateCode,
    });
    throw error;
  }
}
