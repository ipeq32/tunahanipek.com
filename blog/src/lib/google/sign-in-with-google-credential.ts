'use client';

import { signIn } from 'next-auth/react';
import { resolveAuthCallbackPath } from '@/lib/auth/callback-path';
import {
  requestGoogleCredential,
  type GoogleCredentialRequestResult,
} from '@/lib/google/google-gsi-client';

type SignInWithGoogleCredentialOptions = {
  clientId: string;
  credential?: string;
  callbackPath?: string | null;
  onSuccess?: () => void;
  onError?: () => void;
};

async function completeGoogleCredentialSignIn(
  credential: string,
  callbackPath: string | null | undefined,
  onSuccess?: () => void,
  onError?: () => void
) {
  const result = await signIn('google-one-tap', {
    credential,
    redirect: false,
  });

  if (!result?.ok || result.error) {
    onError?.();
    return;
  }

  onSuccess?.();

  const destination = resolveAuthCallbackPath(
    callbackPath,
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.assign(destination);
}

export async function signInWithGoogleCredential({
  clientId,
  credential,
  callbackPath,
  onSuccess,
  onError,
}: SignInWithGoogleCredentialOptions): Promise<GoogleCredentialRequestResult | void> {
  if (credential) {
    await completeGoogleCredentialSignIn(
      credential,
      callbackPath,
      onSuccess,
      onError
    );
    return;
  }

  return requestGoogleCredential(clientId, async (receivedCredential) => {
    await completeGoogleCredentialSignIn(
      receivedCredential,
      callbackPath,
      onSuccess,
      onError
    );
  });
}
