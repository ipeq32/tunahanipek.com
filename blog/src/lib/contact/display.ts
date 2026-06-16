import type { AddressData } from '@/lib/address/types';
import { isTurkeyCountry } from '@/lib/address/types';

export function parsePhoneDigits(phone: string): string {
  const trimmed = phone.trim();
  let digits = phone.replace(/\D/g, '');

  if (trimmed.startsWith('+90') && digits.startsWith('90')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('90') && digits.length > 10) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0') && digits.length > 10) {
    digits = digits.slice(1);
  }

  // +90 prefix silinirken kalan ülke kodu parçası (ör. "+90 (90")
  if (digits === '90') {
    return '';
  }

  return digits.slice(0, 10);
}

export function formatPhoneDigits(digits: string): string {
  const national = digits.replace(/\D/g, '').slice(0, 10);

  if (!national || national === '90') {
    return '';
  }

  if (national.length <= 3) {
    return `+90 (${national}`;
  }

  if (national.length <= 6) {
    return `+90 (${national.slice(0, 3)}) ${national.slice(3)}`;
  }

  return `+90 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = parsePhoneDigits(phone);

  if (digits.length === 10) {
    return `+90 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const trimmed = phone.trim();
  return trimmed || phone;
}

export function formatPhoneInput(phone: string): string {
  return formatPhoneDigits(parsePhoneDigits(phone));
}

export function normalizePhoneForStorage(phone: string): string {
  return parsePhoneDigits(phone);
}

export function resolvePublicEmail(
  contactEmail: string | null | undefined,
  email: string
): string {
  const trimmed = contactEmail?.trim();
  return trimmed || email;
}

export function buildTelHref(phone: string): string {
  const digits = parsePhoneDigits(phone);

  if (!digits) {
    return `tel:${phone}`;
  }

  return `tel:+90${digits}`;
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
