import { NextResponse } from 'next/server';
import { ADDRESS_CACHE_HEADERS } from '@/lib/address/fetch-utils';
import { getGeocodedStates } from '@/lib/address/geocoded-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('countryCode');

  if (!countryCode) {
    return NextResponse.json(
      { error: 'countryCode is required' },
      { status: 400 }
    );
  }

  try {
    const data = await getGeocodedStates(countryCode);
    return NextResponse.json(
      { data },
      { headers: ADDRESS_CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to load states' },
      { status: 502 }
    );
  }
}
