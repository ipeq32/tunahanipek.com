import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: {
      provider: true,
      providerAccountId: true,
    },
    orderBy: { provider: 'asc' },
  });

  return NextResponse.json({
    data: accounts,
    hasPassword: Boolean(session.user.hasPassword),
  });
}
