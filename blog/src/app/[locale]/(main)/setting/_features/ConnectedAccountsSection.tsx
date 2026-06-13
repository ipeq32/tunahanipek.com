'use client';

import { Button } from '@/components/ui/button';
import { ContentCard } from '@/components/layout/content-card';
import type { EnabledOAuthProviders, OAuthProviderId } from '@/lib/oauth/config';
import { cn } from '@/lib/utils';
import { Github, Link2, Linkedin, Loader2, Unlink } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { requestGoogleCredential } from '@/lib/google/google-gsi-client';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { useCallback, useState, type ComponentType } from 'react';
import { toast } from 'sonner';

type ProviderIcon = ComponentType<{ className?: string }>;

type ConnectedAccountsSectionProps = {
  linkedProviders: OAuthProviderId[];
  enabledProviders: EnabledOAuthProviders;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const providerMeta: Record<
  OAuthProviderId,
  {
    labelKey: 'google' | 'github' | 'linkedin';
    icon: ProviderIcon;
  }
> = {
  google: { labelKey: 'google', icon: GoogleIcon },
  github: { labelKey: 'github', icon: Github },
  linkedin: { labelKey: 'linkedin', icon: Linkedin },
};

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 space-y-1">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function ConnectedAccountsSection({
  linkedProviders,
  enabledProviders,
}: ConnectedAccountsSectionProps) {
  const t = useTranslations('Settings.ConnectedAccounts');
  const router = useRouter();
  const pathname = usePathname();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(
    null
  );
  const [linked, setLinked] = useState(linkedProviders);

  const availableProviders = (Object.keys(providerMeta) as OAuthProviderId[]).filter(
    (provider) => enabledProviders[provider]
  );

  const handleLink = useCallback(
    async (provider: OAuthProviderId) => {
      setLoadingProvider(provider);

      try {
        if (provider === 'google') {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (!clientId) {
            throw new Error('google-not-configured');
          }

          await requestGoogleCredential(clientId, async (credential) => {
            const response = await fetch('/api/user/accounts/link/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential }),
            });

            if (!response.ok) {
              throw new Error('google-link-failed');
            }

            setLinked((current) =>
              current.includes('google') ? current : [...current, 'google']
            );
            toast.success(t('linkSuccess'));
            router.refresh();
          });

          return;
        }

        const intentResponse = await fetch('/api/user/accounts/link-intent', {
          method: 'POST',
        });

        if (!intentResponse.ok) {
          throw new Error('link-intent-failed');
        }

        await signIn(provider, { callbackUrl: pathname || '/setting' });
      } catch {
        toast.error(t('linkError'));
      } finally {
        setLoadingProvider(null);
      }
    },
    [pathname, router, t]
  );

  const handleUnlink = useCallback(
    async (provider: OAuthProviderId) => {
      setUnlinkingProvider(provider);

      try {
        const response = await fetch(`/api/user/accounts/${provider}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          if (data.error === 'Cannot unlink the only sign-in method') {
            toast.error(t('unlinkLastMethodError'));
            return;
          }
          throw new Error('unlink-failed');
        }

        setLinked((current) => current.filter((item) => item !== provider));
        toast.success(t('unlinkSuccess'));
        router.refresh();
      } catch {
        toast.error(t('unlinkError'));
      } finally {
        setUnlinkingProvider(null);
      }
    },
    [router, t]
  );

  if (availableProviders.length === 0) {
    return null;
  }

  return (
    <ContentCard>
      <SectionHeader title={t('title')} description={t('description')} />

      <div className="space-y-3">
        {availableProviders.map((provider) => {
          const meta = providerMeta[provider];
          const Icon = meta.icon;
          const isLinked = linked.includes(provider);
          const isLoading =
            loadingProvider === provider || unlinkingProvider === provider;

          return (
            <div
              key={provider}
              className="flex items-center justify-between gap-4 rounded-xl border border-border/60 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{t(meta.labelKey)}</p>
                  <p className="text-xs text-muted-foreground">
                    {isLinked ? t('connected') : t('notConnected')}
                  </p>
                </div>
              </div>

              {isLinked ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleUnlink(provider)}
                  className="gap-2"
                >
                  {unlinkingProvider === provider ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  {t('disconnect')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  disabled={isLoading || loadingProvider !== null}
                  onClick={() => handleLink(provider)}
                  className={cn('gap-2')}
                >
                  {loadingProvider === provider && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t('connect')}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </ContentCard>
  );
}
