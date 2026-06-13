'use client';

import { useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  isGoogleOneTapEnabled,
  resetGoogleOneTapSession,
  setGoogleCredentialHandler,
  showGoogleOneTap,
} from '@/lib/google/google-gsi-client';

type GoogleOneTapProps = {
  disabled?: boolean;
};

export function GoogleOneTap({ disabled = false }: GoogleOneTapProps) {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routerRef = useRef(router);
  const searchParamsRef = useRef(searchParams);
  const activeRef = useRef(true);
  const wasAuthenticatedRef = useRef(false);

  routerRef.current = router;
  searchParamsRef.current = searchParams;

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    activeRef.current = true;

    if (
      disabled ||
      status === 'authenticated' ||
      !clientId ||
      !isGoogleOneTapEnabled()
    ) {
      return () => {
        activeRef.current = false;
      };
    }

    setGoogleCredentialHandler(async (credential) => {
      if (!activeRef.current) {
        return;
      }

      const result = await signIn('google-one-tap', {
        credential,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        return;
      }

      const callbackPath = searchParamsRef.current.get('callback');
      if (callbackPath?.startsWith('/')) {
        window.location.assign(callbackPath);
        return;
      }

      routerRef.current.refresh();
    });

    showGoogleOneTap(clientId).catch(() => {
      // One Tap is optional; the Google button remains available.
    });

    return () => {
      activeRef.current = false;
    };
  }, [clientId, disabled, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      wasAuthenticatedRef.current = true;
      return;
    }

    if (status === 'unauthenticated' && wasAuthenticatedRef.current) {
      resetGoogleOneTapSession();
      wasAuthenticatedRef.current = false;
    }
  }, [status]);

  return null;
}
