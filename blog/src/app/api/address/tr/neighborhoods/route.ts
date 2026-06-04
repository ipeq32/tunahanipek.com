import { NextResponse } from 'next/server';
import { ADDRESS_CACHE_HEADERS } from '@/lib/address/fetch-utils';
import { getTurkiyeSettlements } from '@/lib/address/turkiye-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = Number(searchParams.get('districtId'));
  const name = searchParams.get('name') ?? undefined;
  const limit = Number(searchParams.get('limit') ?? 50);

  if (!Number.isFinite(districtId) || districtId <= 0) {
    return NextResponse.json(
      { error: 'districtId is required' },
      { status: 400 }
    );
  }

  try {
    const data = await getTurkiyeSettlements(
      districtId,
      name,
      Number.isFinite(limit) && limit > 0 ? limit : 50
    );
    return NextResponse.json(
      { data },
      { headers: ADDRESS_CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to load settlements' },
      { status: 502 }
    );
  }
}
