'use client';

import { signIn } from 'next-auth/react';

export type OAuthRedirectProvider = 'github' | 'linkedin';

export type StartOAuthSignInResult =
  | { status: 'redirect'; url: string }
  | { status: 'error'; code: string };

export async function startOAuthSignIn(
  provider: OAuthRedirectProvider,
  callbackUrl: string
): Promise<StartOAuthSignInResult> {
  const result = await signIn(provider, {
    callbackUrl,
    redirect: false,
  });

  if (result?.error) {
    return { status: 'error', code: result.error };
  }

  if (result?.url) {
    return { status: 'redirect', url: result.url };
  }

  return { status: 'error', code: 'Configuration' };
}
