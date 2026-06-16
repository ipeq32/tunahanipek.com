'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from '@/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormFieldFooter,
  FormItem,
  FormLabel,
  FormMessage,
  FormRequiredIndicator,
} from '@/components/ui/form';
import { CharacterCount } from '@/components/ui/character-count';
import { FIELD_LIMITS } from '@/lib/form/field-limits';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { locales } from '@/config';
import { useAiStatus } from '@/hooks/use-ai-status';
import { hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import {
  SNIPPET_CONTENT_MAX,
  SNIPPET_CONTENT_MIN,
  createAddSiteCopyLineSchema,
  type AddSiteCopyLineFormValues,
} from '@/lib/validations/site-snippets';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2, Plus, Sparkles, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

type EditorTab = 'TIP' | 'FOOTER_MOTTO';
type LocaleCode = (typeof locales)[number];

type ContentByLocale = Record<LocaleCode, string>;

type AddSiteCopyLineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contentByLocale: ContentByLocale, isActive: boolean) => void;
  activeTab: EditorTab;
  exampleLinesByLocale: Record<string, string[]>;
  disabled?: boolean;
};

const defaultValues: AddSiteCopyLineFormValues = {
  tr: '',
  en: '',
  isActive: true,
};

export function AddSiteCopyLineDialog({
  open,
  onOpenChange,
  onSubmit,
  activeTab,
  exampleLinesByLocale,
  disabled = false,
}: AddSiteCopyLineDialogProps) {
  const t = useTranslations('Admin.SiteCopy');
  const tAi = useTranslations('Admin.SiteCopy.ai');
  const { data: session } = useSession();
  const { available, loading: aiLoading } = useAiStatus();
  const activeId = useId();
  const topicId = useId();
  const [topic, setTopic] = useState('');
  const [aiBusy, setAiBusy] = useState<
    'generate' | 'translate' | 'improve-tr' | 'improve-en' | null
  >(null);

  const schema = useMemo(
    () =>
      createAddSiteCopyLineSchema(
        (locale) => t('addLineContentRequired', { locale }),
        {
          tooShort: t('contentTooShort', { min: SNIPPET_CONTENT_MIN }),
          tooLong: t('contentTooLong', { max: SNIPPET_CONTENT_MAX }),
        }
      ),
    [t]
  );

  const form = useForm<AddSiteCopyLineFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

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
  const showAiPanel = canUseAi && !aiLoading && available;

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(defaultValues);
    setTopic('');
    setAiBusy(null);
  }, [form, open]);

  async function callAi(body: Record<string, unknown>) {
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
      throw new Error(json.error ?? tAi('error'));
    }

    return json.data;
  }

  async function runGenerateBoth() {
    setAiBusy('generate');

    try {
      const entries = await Promise.all(
        locales.map(async (code) => {
          const data = await callAi({
            action: 'generate',
            type: activeTab,
            locale: code,
            count: 1,
            topic: topic.trim() || undefined,
            lines: (exampleLinesByLocale[code] ?? []).slice(0, 5),
          });

          return [code, data?.items?.[0] ?? ''] as const;
        })
      );

      for (const [code, line] of entries) {
        form.setValue(code, line, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }

      toast.success(t('addLineGenerateSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tAi('error'));
    } finally {
      setAiBusy(null);
    }
  }

  async function runTranslate(
    sourceLocale: LocaleCode,
    targetLocale: LocaleCode
  ) {
    const sourceLine = form.getValues(sourceLocale).trim();
    if (!sourceLine) {
      return;
    }

    setAiBusy('translate');

    try {
      const data = await callAi({
        action: 'translate',
        type: activeTab,
        locale: targetLocale,
        sourceLocale,
        lines: [sourceLine],
      });

      const translated = data?.items?.[0];
      if (!translated) {
        toast.error(tAi('error'));
        return;
      }

      form.setValue(targetLocale, translated, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success(t('addLineTranslateSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tAi('error'));
    } finally {
      setAiBusy(null);
    }
  }

  async function runImprove(code: LocaleCode) {
    const line = form.getValues(code).trim();
    if (!line) {
      return;
    }

    setAiBusy(code === 'tr' ? 'improve-tr' : 'improve-en');

    try {
      const data = await callAi({
        action: 'improve',
        type: activeTab,
        locale: code,
        line,
      });

      if (!data?.item) {
        toast.error(tAi('error'));
        return;
      }

      form.setValue(code, data.item, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success(tAi('improveSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tAi('error'));
    } finally {
      setAiBusy(null);
    }
  }

  const handleSubmit = form.handleSubmit((values) => {
    const trimmed = Object.fromEntries(
      locales.map((code) => [code, values[code].trim()])
    ) as ContentByLocale;

    onSubmit(trimmed, values.isActive);
    onOpenChange(false);
  });

  const formDisabled = disabled || aiBusy !== null;
  const isActive = form.watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,760px)] max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-2 border-b border-border/50 px-6 pb-4 pt-6 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {t('addLineTitle')}
          </DialogTitle>
          <DialogDescription>{t('addLineDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <div className="max-h-[min(62vh,560px)] space-y-4 overflow-y-auto px-6 py-5">
              {canUseAi && aiLoading ? (
                <p className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  {tAi('loading')}
                </p>
              ) : null}

              {canUseAi && !aiLoading && !available ? (
                <p className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  {tAi('notConfigured')}{' '}
                  {canManageAiSettings ? (
                    <Link
                      href="/setting"
                      className="font-medium text-teal-600 underline"
                    >
                      {tAi('openSettings')}
                    </Link>
                  ) : null}
                </p>
              ) : null}

              {showAiPanel ? (
                <div
                  className={cn(
                    'space-y-3 rounded-2xl border border-violet-500/20 p-4',
                    'bg-gradient-to-br from-violet-500/8 via-transparent to-teal-500/8'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('addLineAiTitle')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('addLineAiDescription')}
                      </p>
                    </div>
                  </div>

                  <Input
                    id={topicId}
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder={tAi('topicPlaceholder')}
                    disabled={formDisabled}
                    className="bg-background/70"
                  />

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={formDisabled}
                    className="border-violet-500/30 bg-background/70"
                    onClick={() => void runGenerateBoth()}
                  >
                    {aiBusy === 'generate' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {t('addLineGenerate')}
                  </Button>
                </div>
              ) : null}

              <div className="space-y-4">
                {locales.map((code) => {
                  const otherLocale = locales.find((item) => item !== code);
                  const contentId = `add-line-${code}`;
                  const watchedValue = form.watch(code);
                  const hasContent = Boolean(watchedValue.trim());
                  const canTranslateFromOther =
                    showAiPanel &&
                    otherLocale &&
                    form.watch(otherLocale).trim() &&
                    !hasContent;

                  return (
                    <FormField
                      key={code}
                      control={form.control}
                      name={code}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <FormLabel htmlFor={contentId}>
                              {t('addLineContentLabel', {
                                locale: code.toUpperCase(),
                              })}
                              <FormRequiredIndicator />
                            </FormLabel>
                            <div className="flex flex-wrap gap-1.5">
                              {canTranslateFromOther ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  disabled={formDisabled}
                                  onClick={() =>
                                    void runTranslate(otherLocale, code)
                                  }
                                >
                                  {aiBusy === 'translate' ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-3.5 w-3.5" />
                                  )}
                                  {tAi('translate', {
                                    locale: otherLocale.toUpperCase(),
                                  })}
                                </Button>
                              ) : null}
                              {showAiPanel && hasContent ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  disabled={formDisabled}
                                  onClick={() => void runImprove(code)}
                                >
                                  {aiBusy === `improve-${code}` ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Wand2 className="h-3.5 w-3.5" />
                                  )}
                                  {tAi('improve')}
                                </Button>
                              ) : null}
                            </div>
                          </div>
                          <FormControl>
                            <Textarea
                              id={contentId}
                              rows={4}
                              autoFocus={code === 'tr' && !showAiPanel}
                              disabled={formDisabled}
                              placeholder={t('contentPlaceholder')}
                              className="font-mono text-[13px] leading-relaxed"
                              {...field}
                            />
                          </FormControl>
                          <FormFieldFooter>
                            <FormMessage />
                            <CharacterCount
                              value={field.value}
                              min={FIELD_LIMITS.siteSnippet.content.min}
                              max={FIELD_LIMITS.siteSnippet.content.max}
                            />
                          </FormFieldFooter>
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>

              <label
                htmlFor={activeId}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
              >
                <input
                  id={activeId}
                  type="checkbox"
                  checked={isActive}
                  disabled={formDisabled}
                  onChange={(event) =>
                    form.setValue('isActive', event.target.checked, {
                      shouldDirty: true,
                    })
                  }
                  className="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500/30"
                />
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {isActive ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                  {t('active')}
                </span>
              </label>
            </div>

            <DialogFooter className="border-t border-border/50 bg-muted/15 px-6 py-4 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                className="bg-background/80"
                onClick={() => onOpenChange(false)}
                disabled={formDisabled}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={formDisabled || !form.formState.isValid}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('addLineSubmit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
