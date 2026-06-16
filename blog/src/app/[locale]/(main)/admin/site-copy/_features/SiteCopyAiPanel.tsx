'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Sparkles, Wand2, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAiStatus } from '@/hooks/use-ai-status';
import { hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

type EditorTab = 'TIP' | 'FOOTER_MOTTO';

type SiteCopyAiPanelProps = {
  activeTab: EditorTab;
  locale: string;
  sourceLocale: string | null;
  sourceLines: string[];
  exampleLines: string[];
  selectedLine: string | null;
  disabled?: boolean;
  onGenerated: (items: string[]) => void;
  onTranslated: (items: string[]) => void;
  onImproved: (item: string) => void;
};

export function SiteCopyAiPanel({
  activeTab,
  locale,
  sourceLocale,
  sourceLines,
  exampleLines,
  selectedLine,
  disabled = false,
  onGenerated,
  onTranslated,
  onImproved,
}: SiteCopyAiPanelProps) {
  const t = useTranslations('Admin.SiteCopy.ai');
  const { data: session } = useSession();
  const { available, loading } = useAiStatus();
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState<
    'generate' | 'translate' | 'improve' | null
  >(null);

  const canUseAi = hasUserPermission(
    session?.user?.permissions,
    PERMISSIONS['ai:content-site-copy'],
    session?.user?.email
  );
  const canManageAiSettings = hasUserPermission(
    session?.user?.permissions,
    PERMISSIONS['ai:settings-read'],
    session?.user?.email
  );

  async function runAi(
    action: 'generate' | 'translate' | 'improve',
    body: Record<string, unknown>
  ) {
    setBusy(action);

    try {
      const response = await fetch('/api/admin/site-snippets/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = (await response.json()) as {
        data?: { items?: string[]; item?: string };
        error?: string;
      };

      if (!response.ok) {
        toast.error(json.error ?? t('error'));
        return;
      }

      if (action === 'generate' && json.data?.items?.length) {
        onGenerated(json.data.items);
        toast.success(t('generateSuccess', { count: json.data.items.length }));
        return;
      }

      if (action === 'translate' && json.data?.items?.length) {
        onTranslated(json.data.items);
        toast.success(t('translateSuccess', { count: json.data.items.length }));
        return;
      }

      if (action === 'improve' && json.data?.item) {
        onImproved(json.data.item);
        toast.success(t('improveSuccess'));
      }
    } catch {
      toast.error(t('error'));
    } finally {
      setBusy(null);
    }
  }

  if (!canUseAi) {
    return null;
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        {t('loading')}
      </div>
    );
  }

  if (!available) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <p>
          {t('notConfigured')}{' '}
          {canManageAiSettings && (
            <Link href="/setting" className="font-medium text-teal-600 underline">
              {t('openSettings')}
            </Link>
          )}
        </p>
      </div>
    );
  }

  const canTranslate = Boolean(sourceLocale && sourceLines.length > 0);

  return (
    <div
      className={cn(
        'space-y-4 rounded-2xl border border-violet-500/20 p-4',
        'bg-gradient-to-br from-violet-500/8 via-transparent to-teal-500/8'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{t('title')}</p>
          <p className="text-xs text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <Input
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        placeholder={t('topicPlaceholder')}
        disabled={disabled || busy !== null}
        className="bg-background/70"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || busy !== null}
          className="border-violet-500/30 bg-background/70"
          onClick={() =>
            void runAi('generate', {
              action: 'generate',
              type: activeTab,
              locale,
              count: 3,
              topic: topic.trim() || undefined,
              lines: exampleLines.slice(0, 5),
            })
          }
        >
          {busy === 'generate' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {t('generate')}
        </Button>

        {canTranslate && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || busy !== null}
            className="border-violet-500/30 bg-background/70"
            onClick={() =>
              void runAi('translate', {
                action: 'translate',
                type: activeTab,
                locale,
                sourceLocale,
                lines: sourceLines,
              })
            }
          >
            {busy === 'translate' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
            {t('translate', { locale: sourceLocale?.toUpperCase() ?? '' })}
          </Button>
        )}

        {selectedLine?.trim() && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || busy !== null}
            className="border-violet-500/30 bg-background/70"
            onClick={() =>
              void runAi('improve', {
                action: 'improve',
                type: activeTab,
                locale,
                line: selectedLine,
              })
            }
          >
            {busy === 'improve' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {t('improve')}
          </Button>
        )}
      </div>
    </div>
  );
}
