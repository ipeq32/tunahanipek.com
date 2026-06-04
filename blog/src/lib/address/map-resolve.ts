import { getGeocodedCountries, getGeocodedStates } from './geocoded-api';
import type { GeocodeResult, NominatimAddressDetails } from './nominatim';
import { reverseNominatim } from './nominatim';
import {
  getTurkiyeDistricts,
  getTurkiyeProvinces,
  getTurkiyeSettlements,
} from './turkiye-api';
import type { AddressFormValues, AddressOption } from './types';
import { isTurkeyCountry } from './types';

export function normalizeLocationName(name: string): string {
  return name
    .toLocaleLowerCase('tr')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchByName(
  options: AddressOption[],
  name: string | undefined
): AddressOption | undefined {
  if (!name?.trim()) return undefined;
  const target = normalizeLocationName(name);
  if (!target) return undefined;

  const exact = options.find(
    (o) => normalizeLocationName(o.label) === target
  );
  if (exact) return exact;

  return options.find((o) => {
    const label = normalizeLocationName(o.label);
    return label.includes(target) || target.includes(label);
  });
}

function pickFirst(...values: (string | undefined)[]): string {
  for (const v of values) {
    if (v?.trim()) return v.trim();
  }
  return '';
}

function extractTurkeyParts(addr: NominatimAddressDetails) {
  return {
    provinceName: pickFirst(addr.state, addr.province),
    districtName: pickFirst(
      addr.city,
      addr.town,
      addr.county,
      addr.city_district
    ),
    neighborhoodName: pickFirst(
      addr.suburb,
      addr.neighbourhood,
      addr.village
    ),
    street: pickFirst(addr.road),
    buildingNo: pickFirst(addr.house_number),
    postcode: pickFirst(addr.postcode),
  };
}

function extractGlobalParts(addr: NominatimAddressDetails) {
  return {
    stateName: pickFirst(addr.state, addr.province),
    cityName: pickFirst(
      addr.city,
      addr.town,
      addr.village,
      addr.city_district,
      addr.county
    ),
    neighborhoodName: pickFirst(addr.suburb, addr.neighbourhood),
    street: pickFirst(addr.road),
    buildingNo: pickFirst(addr.house_number),
    postcode: pickFirst(addr.postcode),
  };
}

async function resolveTurkeyFormValues(
  geocode: GeocodeResult
): Promise<Partial<AddressFormValues>> {
  const addr = geocode.address ?? {};
  const parts = extractTurkeyParts(addr);

  const provinces = await getTurkiyeProvinces();
  const province = matchByName(provinces, parts.provinceName);

  let district: AddressOption | undefined;
  if (province) {
    const districts = await getTurkiyeDistricts(Number(province.id));
    district = matchByName(districts, parts.districtName);
  }

  let neighborhoodId: number | null = null;
  let neighborhoodName = parts.neighborhoodName;
  let settlementType: AddressFormValues['settlementType'];

  if (district && parts.neighborhoodName) {
    const settlements = await getTurkiyeSettlements(
      Number(district.id),
      parts.neighborhoodName,
      20
    );
    const settlement = matchByName(settlements, parts.neighborhoodName);
    if (settlement) {
      neighborhoodId = Number(settlement.id);
      neighborhoodName = settlement.label;
      settlementType =
        settlement.meta === 'village' ? 'village' : 'neighborhood';
    }
  }

  return {
    countryCode: 'TR',
    countryName: pickFirst(addr.country, 'Türkiye'),
    provinceId: province ? Number(province.id) : null,
    provinceName: province?.label ?? parts.provinceName,
    districtId: district ? Number(district.id) : null,
    districtName: district?.label ?? parts.districtName,
    stateCode: '',
    stateName: '',
    cityName: '',
    neighborhoodId,
    neighborhoodName,
    settlementType,
    street: parts.street,
    buildingNo: parts.buildingNo,
    apartment: '',
    site: '',
    details: parts.postcode ? `PK: ${parts.postcode}` : '',
    latitude: geocode.lat,
    longitude: geocode.lon,
    formattedMapAddress: geocode.displayName,
  };
}

async function resolveGlobalFormValues(
  geocode: GeocodeResult
): Promise<Partial<AddressFormValues>> {
  const addr = geocode.address ?? {};
  const countryCode = (addr.country_code ?? '').toUpperCase();
  const parts = extractGlobalParts(addr);

  const countries = await getGeocodedCountries();
  const country =
    countries.find((c) => c.id.toUpperCase() === countryCode) ??
    matchByName(countries, addr.country);

  let stateCode = '';
  let stateName = parts.stateName;

  if (country && parts.stateName) {
    const states = await getGeocodedStates(country.id);
    const state = matchByName(states, parts.stateName);
    if (state) {
      stateCode = state.id;
      stateName = state.label;
    }
  }

  return {
    countryCode: country?.id ?? countryCode,
    countryName: country?.label ?? pickFirst(addr.country),
    provinceId: null,
    provinceName: '',
    districtId: null,
    districtName: '',
    stateCode,
    stateName,
    cityName: parts.cityName,
    neighborhoodId: null,
    neighborhoodName: parts.neighborhoodName,
    street: parts.street,
    buildingNo: parts.buildingNo,
    apartment: '',
    site: '',
    details: parts.postcode ? `ZIP: ${parts.postcode}` : '',
    latitude: geocode.lat,
    longitude: geocode.lon,
    formattedMapAddress: geocode.displayName,
  };
}

export async function resolveMapLocation(
  lat: number,
  lon: number
): Promise<Partial<AddressFormValues>> {
  const geocode = await reverseNominatim(lat, lon);
  if (!geocode) {
    throw new Error('Reverse geocode returned no result');
  }

  const countryCode = geocode.address?.country_code?.toUpperCase() ?? '';

  if (isTurkeyCountry(countryCode)) {
    return resolveTurkeyFormValues(geocode);
  }

  return resolveGlobalFormValues(geocode);
}

export async function resolveMapLocationFromGeocode(
  geocode: GeocodeResult
): Promise<Partial<AddressFormValues>> {
  const countryCode = geocode.address?.country_code?.toUpperCase() ?? '';

  if (isTurkeyCountry(countryCode)) {
    return resolveTurkeyFormValues(geocode);
  }

  return resolveGlobalFormValues(geocode);
}
