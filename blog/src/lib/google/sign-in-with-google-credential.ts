'use client';

import { signIn } from 'next-auth/react';
import { requestGoogleCredential } from '@/lib/google/google-gsi-client';

type SignInWithGoogleCredentialOptions = {
  clientId: string;
  callbackPath?: string | null;
  onSuccess?: () => void;
  onError?: () => void;
};

export async function signInWithGoogleCredential({
  clientId,
  callbackPath,
  onSuccess,
  onError,
}: SignInWithGoogleCredentialOptions) {
  await requestGoogleCredential(clientId, async (credential) => {
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
  });
}
