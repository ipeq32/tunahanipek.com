'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { Link } from '@/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAiStatus } from '@/hooks/use-ai-status';
import { isSuperAdmin } from '@/lib/auth-roles';
import type { LanguageDto } from '@/lib/languages';
import {
  isBlogTranslationFilled,
  isProjectTranslationFilled,
  isShortHtmlContent,
  stripHtmlText,
} from '@/lib/translation-form-utils';
import { cn } from '@/lib/utils';

type BlogFields = {
  title?: string;
  content?: string;
  summary?: string;
};

type ProjectFields = {
  title?: string;
  description?: string;
};

type AiContentActionsProps =
  | {
      contentType: 'blog';
      activeLanguage: string;
      languages: LanguageDto[];
      activeFields: BlogFields;
      allTranslations: Record<string, BlogFields>;
      disabled?: boolean;
      onApply: (fields: BlogFields) => void;
    }
  | {
      contentType: 'project';
      activeLanguage: string;
      languages: LanguageDto[];
      activeFields: ProjectFields;
      allTranslations: Record<string, ProjectFields>;
      disabled?: boolean;
      onApply: (fields: ProjectFields) => void;
    };

function findSourceLanguage(
  languages: LanguageDto[],
  activeLanguage: string,
  allTranslations: Record<string, BlogFields | ProjectFields>,
  contentType: 'blog' | 'project',
): string | null {
  for (const language of languages) {
    if (language.code === activeLanguage) continue;
    const fields = allTranslations[language.code];
    if (!fields) continue;

    const filled =
      contentType === 'blog'
        ? isBlogTranslationFilled(fields as BlogFields)
        : isProjectTranslationFilled(fields as ProjectFields);

    if (filled) {
      return language.code;
    }
  }

  return null;
}

export default function AiContentActions(props: AiContentActionsProps) {
  const t = useTranslations('Content.Ai');
  const { data: session } = useSession();
  const { available, loading: statusLoading } = useAiStatus();
  const canManageAiSettings = isSuperAdmin(session?.user?.role);
  const [busyAction, setBusyAction] = useState<'translate' | 'expand' | null>(
    null,
  );

  const sourceLanguage = findSourceLanguage(
    props.languages,
    props.activeLanguage,
    props.allTranslations,
    props.contentType,
  );

  const activeFilled =
    props.contentType === 'blog'
      ? isBlogTranslationFilled(props.activeFields as BlogFields)
      : isProjectTranslationFilled(props.activeFields as ProjectFields);

  const canTranslate = Boolean(sourceLanguage) && !activeFilled;

  const canExpand =
    props.contentType === 'blog'
      ? Boolean(
          props.activeFields.title?.trim() &&
            (!stripHtmlText((props.activeFields as BlogFields).content) ||
              isShortHtmlContent((props.activeFields as BlogFields).content) ||
              isShortHtmlContent((props.activeFields as BlogFields).summary)),
        ) && !activeFilled
      : Boolean(
          props.activeFields.title?.trim() &&
            (!stripHtmlText((props.activeFields as ProjectFields).description) ||
              isShortHtmlContent(
                (props.activeFields as ProjectFields).description,
              )),
        ) && !activeFilled;

  async function runAction(action: 'translate' | 'expand') {
    setBusyAction(action);

    try {
      const sourceFields =
        action === 'translate' && sourceLanguage
          ? props.allTranslations[sourceLanguage]
          : props.activeFields;

      const body = {
        action,
        contentType: props.contentType,
        sourceLanguage:
          action === 'translate' ? sourceLanguage : props.activeLanguage,
        targetLanguage:
          action === 'translate' ? props.activeLanguage : undefined,
        fields: sourceFields,
      };

      const res = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as {
        data?: BlogFields & ProjectFields;
        error?: string;
      };

      if (!res.ok) {
        toast.error(
          json.error ??
            (action === 'translate' ? t('translateError') : t('expandError')),
        );
        return;
      }

      if (json.data) {
        props.onApply(json.data);
        toast.success(
          action === 'translate' ? t('translateSuccess') : t('expandSuccess'),
        );
      }
    } catch {
      toast.error(
        action === 'translate' ? t('translateError') : t('expandError'),
      );
    } finally {
      setBusyAction(null);
    }
  }

  if (statusLoading) {
    return null;
  }

  if (!available) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <p>
          {t('notConfigured')}{' '}
          {canManageAiSettings && (
            <Link href="/setting" className="font-medium text-teal-600 underline">
              {t('openSettings')}
            </Link>
          )}
        </p>
        {!canManageAiSettings && (
          <p className="mt-1 text-xs">{t('notConfiguredContactAdmin')}</p>
        )}
      </div>
    );
  }

  if (!canTranslate && !canExpand) {
    return null;
  }

  const targetLanguageName =
    props.languages.find((l) => l.code === props.activeLanguage)?.name ??
    props.activeLanguage;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-violet-500/20',
        'bg-gradient-to-r from-violet-500/5 to-indigo-500/5 px-4 py-3',
      )}
    >
      <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
        {t('cardTitle')}
      </p>
      <div className="flex flex-wrap gap-2">
        {canTranslate && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={props.disabled || busyAction !== null}
            onClick={() => void runAction('translate')}
            className="border-violet-500/30 bg-background/60"
          >
            {busyAction === 'translate' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {t('translateButton', { language: targetLanguageName })}
          </Button>
        )}
        {canExpand && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={props.disabled || busyAction !== null}
            onClick={() => void runAction('expand')}
            className="border-violet-500/30 bg-background/60"
          >
            {busyAction === 'expand' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {t('expandButton')}
          </Button>
        )}
      </div>
    </div>
  );
}
