import type { AddressData } from '@/lib/address/types';
import { isTurkeyCountry } from '@/lib/address/types';

export function resolvePublicEmail(
  contactEmail: string | null | undefined,
  email: string
): string {
  const trimmed = contactEmail?.trim();
  return trimmed || email;
}

export function buildTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (!digits) {
    return `tel:${phone}`;
  }

  if (digits.startsWith('90') && digits.length >= 12) {
    return `tel:+${digits}`;
  }

  if (digits.startsWith('0') && digits.length >= 10) {
    return `tel:+90${digits.slice(1)}`;
  }

  return `tel:+${digits}`;
}

export function formatAddressShort(
  addressData: AddressData | null,
  fallbackAddress?: string | null
): string | null {
  if (addressData) {
    if (isTurkeyCountry(addressData.countryCode)) {
      const parts = [addressData.districtName, addressData.provinceName].filter(
        Boolean
      ) as string[];

      if (parts.length > 0) {
        return parts.join('/');
      }
    }

    const international = [addressData.cityName, addressData.stateName].filter(
      Boolean
    ) as string[];

    if (international.length > 0) {
      return international.join(', ');
    }
  }

  const trimmed = fallbackAddress?.trim();
  return trimmed || null;
}

export function buildMapsHref(
  addressData: AddressData | null,
  address?: string | null
): string | null {
  if (
    addressData?.latitude != null &&
    addressData?.longitude != null &&
    Number.isFinite(addressData.latitude) &&
    Number.isFinite(addressData.longitude)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${addressData.latitude},${addressData.longitude}`;
  }

  const label =
    address?.trim() ||
    addressData?.formattedMapAddress?.trim() ||
    null;

  if (!label) {
    return null;
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(label)}`;
}
