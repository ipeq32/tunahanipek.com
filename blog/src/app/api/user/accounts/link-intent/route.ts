import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { createLinkIntent } from '@/lib/oauth/link-intent';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const context = await requirePermission(PERMISSIONS['account:link']);
  if (!context || !context.session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await createLinkIntent({
    userId: context.userId,
    email: context.session.user.email,
  });

  return NextResponse.json({ success: true });
}
