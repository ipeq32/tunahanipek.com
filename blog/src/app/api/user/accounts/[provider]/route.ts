import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_PROVIDERS = new Set(['google', 'github', 'linkedin']);

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  const { provider } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const account = user.accounts.find((item) => item.provider === provider);
    if (!account) {
      return NextResponse.json({ error: 'Account not linked' }, { status: 404 });
    }

    const remainingAccounts = user.accounts.filter(
      (item) => item.provider !== provider
    );
    const hasPassword = Boolean(user.hashedPassword);

    if (!hasPassword && remainingAccounts.length === 0) {
      return NextResponse.json(
        { error: 'Cannot unlink the only sign-in method' },
        { status: 400 }
      );
    }

    await prisma.account.delete({
      where: { id: account.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Account unlink failed', {
      provider,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
