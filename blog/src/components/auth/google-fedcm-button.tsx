'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  loadGoogleGsiScript,
  mountGoogleRenderButton,
  pushGoogleCredentialHandler,
} from '@/lib/google/google-gsi-client';
import { useEffect, useRef, type ReactNode } from 'react';

type GoogleFedCmButtonProps = {
  clientId: string;
  onCredential: (credential: string) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
};

export function GoogleFedCmButton({
  clientId,
  onCredential,
  disabled = false,
  loading = false,
  loadingLabel,
  children,
  className,
  icon,
}: GoogleFedCmButtonProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  useEffect(() => {
    const container = overlayRef.current;
    if (!container || disabled) {
      return;
    }

    let cancelled = false;
    let releaseHandler: (() => void) | null = null;

    const mount = async () => {
      await loadGoogleGsiScript();
      if (cancelled || !overlayRef.current) {
        return;
      }

      releaseHandler = pushGoogleCredentialHandler((credential) =>
        onCredentialRef.current(credential)
      );

      await mountGoogleRenderButton(container, clientId);
    };

    void mount();

    return () => {
      cancelled = true;
      releaseHandler?.();
    };
  }, [clientId, disabled]);

  return (
    <div className={cn('relative w-full', className)}>
      <div
        ref={overlayRef}
        aria-hidden={loading || disabled}
        className={cn(
          'absolute inset-0 z-10 overflow-hidden',
          loading || disabled ? 'pointer-events-none opacity-0' : 'opacity-[0.011]'
        )}
      />
      <Button
        type="button"
        variant="outline"
        className="pointer-events-none w-full justify-center gap-2 text-foreground hover:text-accent-foreground"
        disabled={disabled || loading}
        tabIndex={-1}
      >
        {icon}
        {loading ? loadingLabel : children}
      </Button>
    </div>
  );
}
