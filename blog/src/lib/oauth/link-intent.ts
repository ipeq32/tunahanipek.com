import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const LINK_INTENT_COOKIE = 'oauth_link_intent';
const LINK_INTENT_MAX_AGE_SECONDS = 5 * 60;

type LinkIntentPayload = {
  userId: string;
  email: string;
};

function getLinkIntentSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is required for OAuth link intent');
  }
  return new TextEncoder().encode(secret);
}

export async function createLinkIntent(payload: LinkIntentPayload) {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email.toLowerCase(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${LINK_INTENT_MAX_AGE_SECONDS}s`)
    .sign(getLinkIntentSecret());

  const cookieStore = await cookies();
  cookieStore.set(LINK_INTENT_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: LINK_INTENT_MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function readLinkIntent(): Promise<LinkIntentPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(LINK_INTENT_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getLinkIntentSecret());
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function clearLinkIntent() {
  const cookieStore = await cookies();
  cookieStore.delete(LINK_INTENT_COOKIE);
}
