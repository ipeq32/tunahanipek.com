import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { verifyGoogleIdToken } from '@/lib/google/verify-id-token';
import { linkOAuthAccountToUser } from '@/lib/oauth/sync-oauth-user';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const linkGoogleSchema = z.object({
  credential: z.string().min(1),
});

export async function POST(request: Request) {
  const context = await requirePermission(PERMISSIONS['account:link']);
  const googleClientId = process.env.AUTH_GOOGLE_ID;

  if (!context || !context.session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!googleClientId) {
    return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = linkGoogleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const payload = await verifyGoogleIdToken(parsed.data.credential, googleClientId);

    if (payload.email.toLowerCase() !== context.session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Google account email does not match your profile email' },
        { status: 400 }
      );
    }

    await linkOAuthAccountToUser(
      context.userId,
      {
        email: payload.email,
        name: payload.name,
        image: payload.picture,
        emailVerified: payload.email_verified ? new Date() : null,
      },
      {
        type: 'oidc',
        provider: 'google',
        providerAccountId: payload.sub,
        id_token: parsed.data.credential,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Google account link failed', {
      userId: context.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to link Google account' }, { status: 500 });
  }
}
