import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { getSiteOwner, type SiteOwnerProfile } from '@/lib/site-owner';

export const revalidate = 300;

export type PublicContactEmailId = 'corporate' | 'personal';

export type PublicContactEmail = {
  id: PublicContactEmailId;
  address: string;
};

export type PublicContactResponse = {
  emails: PublicContactEmail[];
};

function buildPublicContactEmails(
  owner: SiteOwnerProfile,
): PublicContactEmail[] {
  const showCorporate =
    owner.contactEmail &&
    owner.contactEmail.trim().toLowerCase() !== owner.email.toLowerCase();

  if (showCorporate) {
    return [
      { id: 'corporate', address: owner.publicEmail },
      { id: 'personal', address: owner.email },
    ];
  }

  return [{ id: 'corporate', address: owner.publicEmail }];
}

export async function GET() {
  try {
    const owner = await getSiteOwner();

    if (!owner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body: PublicContactResponse = {
      emails: buildPublicContactEmails(owner),
    };

    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    logger.error('Failed to fetch public contact', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
