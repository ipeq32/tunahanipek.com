import 'server-only';

import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

import { PRIMARY_SUPER_ADMIN_EMAIL } from '@/lib/admin/users/primary-super-admin';
import { formatAddressLine } from '@/lib/address/format';
import {
  parseAddressDataJson,
  type AddressData,
} from '@/lib/address/types';
import {
  buildMapsHref,
  formatAddressShort,
  resolvePublicEmail,
} from '@/lib/contact/display';
import { prisma } from '@/lib/prisma';

export const SITE_OWNER_CACHE_TAG = 'site-owner';

export type SiteOwnerProfile = {
  name: string;
  email: string;
  contactEmail: string | null;
  publicEmail: string;
  phone: string | null;
  address: string | null;
  addressData: AddressData | null;
  addressShort: string | null;
  mapsHref: string | null;
  website: string | null;
  image: string | null;
  bio: string | null;
};

function mapSiteOwner(user: {
  name: string;
  email: string;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  addressData: unknown;
  website: string | null;
  image: string | null;
  bio: string | null;
}): SiteOwnerProfile {
  const addressData = parseAddressDataJson(user.addressData);
  const address =
    user.address?.trim() ||
    (addressData ? formatAddressLine(addressData) : null);

  return {
    name: user.name,
    email: user.email,
    contactEmail: user.contactEmail,
    publicEmail: resolvePublicEmail(user.contactEmail, user.email),
    phone: user.phone,
    address,
    addressData,
    addressShort: formatAddressShort(addressData, address),
    mapsHref: buildMapsHref(addressData, address),
    website: user.website,
    image: user.image,
    bio: user.bio,
  };
}

async function querySiteOwner(): Promise<SiteOwnerProfile | null> {
  const user = await prisma.user.findFirst({
    where: {
      email: PRIMARY_SUPER_ADMIN_EMAIL,
      deletedAt: null,
    },
    select: {
      name: true,
      email: true,
      contactEmail: true,
      phone: true,
      address: true,
      addressData: true,
      website: true,
      image: true,
      bio: true,
    },
  });

  if (!user) {
    return null;
  }

  return mapSiteOwner(user);
}

const getCachedSiteOwner = unstable_cache(
  async (): Promise<SiteOwnerProfile | null> => {
    try {
      return await querySiteOwner();
    } catch {
      // Layout/footer her sayfada çağırır; DB kesintisinde tüm UI'yi düşürme.
      return null;
    }
  },
  ['site-owner'],
  { revalidate: 300, tags: [SITE_OWNER_CACHE_TAG] }
);

export async function getSiteOwner(): Promise<SiteOwnerProfile | null> {
  return getCachedSiteOwner();
}

export async function getSiteOwnerDirect(): Promise<SiteOwnerProfile | null> {
  return querySiteOwner();
}

export function revalidateSiteOwner(): void {
  revalidateTag(SITE_OWNER_CACHE_TAG, { expire: 0 });
}
