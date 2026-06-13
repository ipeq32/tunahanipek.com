'use client';

import { signIn } from 'next-auth/react';
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

  if (callbackPath?.startsWith('/')) {
    window.location.assign(callbackPath);
  } else {
    window.location.reload();
  }
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
