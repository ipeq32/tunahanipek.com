import type { SiteOwnerProfile } from '@/lib/site-owner';

export type ContactMapLocation = {
  latitude: number;
  longitude: number;
  addressLabel: string;
  mapsHref: string;
  approximate?: boolean;
};

export function buildGeocodeQuery(owner: SiteOwnerProfile): string | null {
  const data = owner.addressData;

  if (data?.formattedMapAddress?.trim()) {
    return data.formattedMapAddress.trim();
  }

  if (owner.address?.trim()) {
    return owner.address.trim();
  }

  if (data?.districtName && data?.provinceName) {
    const country = data.countryName?.trim() || 'Türkiye';
    return `${data.districtName}, ${data.provinceName}, ${country}`;
  }

  const short = owner.addressShort?.trim();
  if (!short) {
    return null;
  }

  if (short.includes('/')) {
    const [district, province] = short.split('/');
    if (district?.trim() && province?.trim()) {
      return `${district.trim()}, ${province.trim()}, Türkiye`;
    }
  }

  return short;
}

export function resolveContactMapLocation(
  owner: SiteOwnerProfile | null
): ContactMapLocation | null {
  if (!owner) {
    return null;
  }

  const latitude = owner.addressData?.latitude;
  const longitude = owner.addressData?.longitude;

  if (
    latitude == null ||
    longitude == null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const addressLabel = owner.addressShort?.trim();
  const mapsHref = owner.mapsHref;

  if (!addressLabel || !mapsHref) {
    return null;
  }

  return {
    latitude,
    longitude,
    addressLabel,
    mapsHref,
    approximate: false,
  };
}
