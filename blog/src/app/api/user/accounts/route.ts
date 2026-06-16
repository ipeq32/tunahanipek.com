import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const context = await requirePermission(PERMISSIONS['account:read']);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: { userId: context.userId },
    select: {
      provider: true,
      providerAccountId: true,
    },
    orderBy: { provider: 'asc' },
  });

  return NextResponse.json({
    data: accounts,
    hasPassword: Boolean(context.session.user.hasPassword),
  });
}
