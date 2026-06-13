import { auth } from '@/auth';
import { createLinkIntent } from '@/lib/oauth/link-intent';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await createLinkIntent({
    userId: session.user.id,
    email: session.user.email,
  });

  return NextResponse.json({ success: true });
}
