import { NextResponse } from 'next/server';
import { ADDRESS_CACHE_HEADERS } from '@/lib/address/fetch-utils';
import { getTurkiyeProvinces } from '@/lib/address/turkiye-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getTurkiyeProvinces();
    return NextResponse.json(
      { data },
      { headers: ADDRESS_CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to load provinces' },
      { status: 502 }
    );
  }
}
