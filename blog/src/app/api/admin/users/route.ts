import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { getAdminUsersDto } from '@/lib/data/users';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await getAdminUsersDto();
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Failed to fetch admin users', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
