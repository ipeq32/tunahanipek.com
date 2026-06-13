'use client';

import { signIn } from 'next-auth/react';
import {
  getOAuthErrorFromRedirectUrl,
  isOAuthErrorRedirectUrl,
  resolveOAuthCallbackUrl,
} from '@/lib/oauth/resolve-oauth-callback-url';

export type OAuthRedirectProvider = 'github' | 'linkedin';

export type StartOAuthSignInResult =
  | { status: 'redirect'; url: string }
  | { status: 'error'; code: string };

export async function startOAuthSignIn(
  provider: OAuthRedirectProvider,
  callbackPath: string
): Promise<StartOAuthSignInResult> {
  const callbackUrl = resolveOAuthCallbackUrl(callbackPath);

  const result = await signIn(provider, {
    callbackUrl,
    redirect: false,
  });

  if (result?.error) {
    return { status: 'error', code: result.error };
  }

  if (result?.url) {
    if (isOAuthErrorRedirectUrl(result.url)) {
      return {
        status: 'error',
        code: getOAuthErrorFromRedirectUrl(result.url),
      };
    }

    return { status: 'redirect', url: result.url };
  }

  return { status: 'error', code: 'Configuration' };
}
