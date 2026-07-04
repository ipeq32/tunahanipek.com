'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import type { SiteAuthCredentials } from '@/lib/validations/site-auth';

type SiteAuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hints?: string[];
  initialCredentials?: SiteAuthCredentials;
  loading?: boolean;
  onLogin: (credentials: SiteAuthCredentials) => void | Promise<void>;
  onContinueWithoutAuth?: () => void | Promise<void>;
};

export function SiteAuthDialog({
  open,
  onOpenChange,
  hints = [],
  initialCredentials,
  loading = false,
  onLogin,
  onContinueWithoutAuth,
}: SiteAuthDialogProps) {
  const t = useTranslations('Content.SiteAuth');
  const [credentials, setCredentials] = useState<SiteAuthCredentials>({
    username: '',
    password: '',
  });

  useEffect(() => {
    if (open) {
      setCredentials(
        initialCredentials ?? {
          username: '',
          password: '',
        },
      );
    }
  }, [initialCredentials, open]);

  const canLogin =
    credentials.username.trim().length > 0 && credentials.password.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="space-y-2 px-6 pb-2 pt-6 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {t('dialogTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {t('dialogDescription')}
            {hints.length > 0 && (
              <span className="mt-2 block text-xs text-muted-foreground">
                {t('dialogHints', { hints: hints.join(', ') })}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6 py-2">
          <div className="space-y-1.5">
            <label htmlFor="dialog-site-auth-username" className="text-xs font-medium">
              {t('username')}
            </label>
            <Input
              id="dialog-site-auth-username"
              value={credentials.username}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              autoComplete="off"
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="dialog-site-auth-password" className="text-xs font-medium">
              {t('password')}
            </label>
            <PasswordInput
              id="dialog-site-auth-password"
              value={credentials.password}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-col gap-2 border-t border-border/50 bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="bg-background/80"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          {onContinueWithoutAuth && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => void onContinueWithoutAuth()}
              disabled={loading}
            >
              {t('continueWithoutAuth')}
            </Button>
          )}
          <Button
            type="button"
            variant="accent"
            onClick={() => void onLogin(credentials)}
            disabled={loading || !canLogin}
          >
            {t('loginAndContinue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
