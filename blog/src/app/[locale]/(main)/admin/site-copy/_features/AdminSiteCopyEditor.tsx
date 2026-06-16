'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataPagination, createDefaultPagination } from '@/components/ui/data-pagination';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminListCard } from '@/components/admin/admin-ui';
import {
  TerminalCard,
  TerminalCursor,
} from '@/components/ui/terminal-card';
import type { SiteSnippetDto } from '@/lib/site-snippets';
import { locales } from '@/config';
import { cn } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE, type PageSize } from '@/lib/pagination';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Terminal,
  Trash2,
} from 'lucide-react';
import { SiteCopyAiPanel } from './SiteCopyAiPanel';
import { AddSiteCopyLineDialog } from './AddSiteCopyLineDialog';

type LocaleSnippetData = {
  tips: SiteSnippetDto[];
  mottos: SiteSnippetDto[];
};

type AdminSiteCopyEditorProps = {
  initialLocale: string;
  initialDataByLocale: Record<string, LocaleSnippetData>;
  fallbackByLocale: Record<string, { tips: string[]; mottos: string[] }>;
};

type EditorTab = 'TIP' | 'FOOTER_MOTTO';

type SnippetDraft = {
  localId: string;
  content: string;
  isActive: boolean;
};

function toDrafts(snippets: SiteSnippetDto[]): SnippetDraft[] {
  return snippets.map((snippet) => ({
    localId: snippet.id,
    content: snippet.content,
    isActive: snippet.isActive,
  }));
}

function toDraftsFromStrings(contents: string[]): SnippetDraft[] {
  return contents.map((content) => ({
    localId: crypto.randomUUID(),
    content,
    isActive: true,
  }));
}

function buildDraftState(
  dataByLocale: Record<string, LocaleSnippetData>,
  key: 'tips' | 'mottos'
): Record<string, SnippetDraft[]> {
  return Object.fromEntries(
    Object.entries(dataByLocale).map(([code, data]) => [
      code,
      toDrafts(data[key]),
    ])
  );
}

export default function AdminSiteCopyEditor({
  initialLocale,
  initialDataByLocale,
  fallbackByLocale,
}: AdminSiteCopyEditorProps) {
  const t = useTranslations('Admin.SiteCopy');
  const [locale, setLocale] = useState(initialLocale);
  const [activeTab, setActiveTab] = useState<EditorTab>('TIP');
  const [tipsByLocale, setTipsByLocale] = useState<Record<string, SnippetDraft[]>>(
    () => buildDraftState(initialDataByLocale, 'tips')
  );
  const [mottosByLocale, setMottosByLocale] = useState<
    Record<string, SnippetDraft[]>
  >(() => buildDraftState(initialDataByLocale, 'mottos'));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [addLineOpen, setAddLineOpen] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [listLimit, setListLimit] = useState<PageSize>(DEFAULT_PAGE_SIZE);

  const currentDrafts = useMemo(() => {
    const store = activeTab === 'TIP' ? tipsByLocale : mottosByLocale;
    return store[locale] ?? [];
  }, [activeTab, locale, mottosByLocale, tipsByLocale]);

  const listPagination = useMemo(
    () => createDefaultPagination(currentDrafts.length, listPage, listLimit),
    [currentDrafts.length, listLimit, listPage]
  );

  const visibleDrafts = useMemo(() => {
    const start = (listPage - 1) * listLimit;
    return currentDrafts.slice(start, start + listLimit);
  }, [currentDrafts, listLimit, listPage]);

  useEffect(() => {
    setListPage(1);
    setSelectedIndex(null);
  }, [activeTab, locale, currentDrafts.length]);

  const activeCount = currentDrafts.filter(
    (item) => item.isActive && item.content.trim()
  ).length;

  const previewLine = useMemo(() => {
    const active = currentDrafts.find(
      (item) => item.isActive && item.content.trim()
    );
    return active?.content ?? '';
  }, [currentDrafts]);

  const sourceLocale = useMemo(() => {
    return locales.find((code) => code !== locale) ?? null;
  }, [locale]);

  const sourceLines = useMemo(() => {
    if (!sourceLocale) return [];
    const store =
      activeTab === 'TIP' ? tipsByLocale[sourceLocale] : mottosByLocale[sourceLocale];
    return (store ?? [])
      .filter((item) => item.isActive && item.content.trim())
      .map((item) => item.content.trim());
  }, [activeTab, mottosByLocale, sourceLocale, tipsByLocale]);

  const setCurrentDrafts = useCallback(
    (updater: (items: SnippetDraft[]) => SnippetDraft[]) => {
      if (activeTab === 'TIP') {
        setTipsByLocale((prev) => ({
          ...prev,
          [locale]: updater(prev[locale] ?? []),
        }));
        return;
      }

      setMottosByLocale((prev) => ({
        ...prev,
        [locale]: updater(prev[locale] ?? []),
      }));
    },
    [activeTab, locale]
  );

  const switchLocale = useCallback(
    (nextLocale: string) => {
      if (nextLocale === locale) return;

      const hasTips = (tipsByLocale[nextLocale]?.length ?? 0) > 0;
      const hasMottos = (mottosByLocale[nextLocale]?.length ?? 0) > 0;

      if (hasTips && hasMottos) {
        setLocale(nextLocale);
        setSelectedIndex(null);
        return;
      }

      const fallback = fallbackByLocale[nextLocale];
      setTipsByLocale((prev) => ({
        ...prev,
        [nextLocale]:
          prev[nextLocale]?.length
            ? prev[nextLocale]
            : toDraftsFromStrings(fallback?.tips ?? []),
      }));
      setMottosByLocale((prev) => ({
        ...prev,
        [nextLocale]:
          prev[nextLocale]?.length
            ? prev[nextLocale]
            : toDraftsFromStrings(fallback?.mottos ?? []),
      }));
      setLocale(nextLocale);
      setSelectedIndex(null);
    },
    [fallbackByLocale, locale, mottosByLocale, tipsByLocale]
  );

  const refreshAllLocalesFromDatabase = useCallback(async () => {
    setRefreshing(true);

    try {
      const results = await Promise.all(
        locales.map(async (code) => {
          const [tipsResponse, mottosResponse] = await Promise.all([
            fetch(`/api/admin/site-snippets?type=TIP&locale=${code}&all=1`),
            fetch(
              `/api/admin/site-snippets?type=FOOTER_MOTTO&locale=${code}&all=1`
            ),
          ]);

          if (!tipsResponse.ok || !mottosResponse.ok) {
            throw new Error('load failed');
          }

          const tipsPayload = (await tipsResponse.json()) as {
            data: SiteSnippetDto[];
          };
          const mottosPayload = (await mottosResponse.json()) as {
            data: SiteSnippetDto[];
          };

          return {
            code,
            tips: toDrafts(tipsPayload.data),
            mottos: toDrafts(mottosPayload.data),
          };
        })
      );

      setTipsByLocale((prev) => ({
        ...prev,
        ...Object.fromEntries(results.map((item) => [item.code, item.tips])),
      }));
      setMottosByLocale((prev) => ({
        ...prev,
        ...Object.fromEntries(results.map((item) => [item.code, item.mottos])),
      }));
      setSelectedIndex(null);
      toast.success(t('refreshed'));
    } catch {
      toast.error(t('loadError'));
    } finally {
      setRefreshing(false);
    }
  }, [t]);

  const handleSave = async () => {
    const items = currentDrafts
      .map((item) => ({
        content: item.content.trim(),
        isActive: item.isActive,
      }))
      .filter((item) => item.content.length > 0);

    if (!items.length) {
      toast.error(t('emptyError'));
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/site-snippets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          locale,
          items,
        }),
      });

      if (!response.ok) {
        throw new Error('save failed');
      }

      const payload = (await response.json()) as { data: SiteSnippetDto[] };
      const nextDrafts = toDrafts(payload.data);

      if (activeTab === 'TIP') {
        setTipsByLocale((prev) => ({ ...prev, [locale]: nextDrafts }));
      } else {
        setMottosByLocale((prev) => ({ ...prev, [locale]: nextDrafts }));
      }

      toast.success(t('saved'));
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setCurrentDrafts((items) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) {
        return items;
      }

      const next = [...items];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    setSelectedIndex((prev) => {
      if (prev === null) return prev;
      const nextIndex = prev + direction;
      if (nextIndex < 0 || nextIndex >= currentDrafts.length) return prev;
      return nextIndex;
    });
  };

  const appendGeneratedLines = (items: string[]) => {
    setCurrentDrafts((drafts) => [
      ...drafts,
      ...items.map((content) => ({
        localId: crypto.randomUUID(),
        content,
        isActive: true,
      })),
    ]);
  };

  const replaceWithTranslatedLines = (items: string[]) => {
    setCurrentDrafts(() =>
      items.map((content) => ({
        localId: crypto.randomUUID(),
        content,
        isActive: true,
      }))
    );
    setSelectedIndex(null);
  };

  const improveSelectedLine = (item: string) => {
    if (selectedIndex === null) return;

    setCurrentDrafts((drafts) =>
      drafts.map((draft, index) =>
        index === selectedIndex ? { ...draft, content: item } : draft
      )
    );
  };

  const handleAddLine = useCallback(
    (contentByLocale: Record<string, string>, isActive: boolean) => {
      const nextIndex = currentDrafts.length;
      const updateStore =
        activeTab === 'TIP' ? setTipsByLocale : setMottosByLocale;

      updateStore((prev) => {
        const next = { ...prev };

        for (const code of locales) {
          const content = contentByLocale[code]?.trim();
          if (!content) {
            continue;
          }

          next[code] = [
            ...(prev[code] ?? []),
            {
              localId: crypto.randomUUID(),
              content,
              isActive,
            },
          ];
        }

        return next;
      });

      setListPage(Math.floor(nextIndex / listLimit) + 1);
      setSelectedIndex(nextIndex);
    },
    [activeTab, currentDrafts.length, listLimit]
  );

  const tabs: Array<{ id: EditorTab; label: string; icon: typeof Lightbulb }> = [
    { id: 'TIP', label: t('tabs.tips'), icon: Lightbulb },
    { id: 'FOOTER_MOTTO', label: t('tabs.mottos'), icon: Sparkles },
  ];

  const previewFile =
    activeTab === 'TIP' ? '~/did-you-know.md' : '~/dev-jokes.js';

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: t('stats.total'), value: currentDrafts.length },
          { label: t('stats.active'), value: activeCount },
          { label: t('stats.locale'), value: locale.toUpperCase() },
        ].map((stat) => (
          <AdminListCard key={stat.label} className="py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-teal-600 dark:text-teal-400">
              {stat.value}
            </p>
          </AdminListCard>
        ))}
      </div>

      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <AdminListCard className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const count =
                    tab.id === 'TIP'
                      ? (tipsByLocale[locale] ?? []).length
                      : (mottosByLocale[locale] ?? []).length;

              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant={activeTab === tab.id ? 'accent' : 'secondary'}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedIndex(null);
                  }}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <Badge
                    className={cn(
                      'ml-1 border font-mono text-[11px] tabular-nums',
                      activeTab === tab.id
                        ? 'border-white/30 bg-white/20 text-white'
                        : 'border-border/60 bg-background text-foreground'
                    )}
                  >
                    {count}
                  </Badge>
                </Button>
              );
                })}
              </div>

              <div className="flex items-center gap-2">
                <Label className="sr-only">{t('localeLabel')}</Label>
                <div className="flex rounded-xl border border-border/60 bg-background/50 p-1">
                  {locales.map((code) => (
                    <Button
                      key={code}
                      type="button"
                      size="sm"
                      variant={locale === code ? 'accent' : 'ghost'}
                      onClick={() => switchLocale(code)}
                    >
                      {code.toUpperCase()}
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={refreshing}
                  onClick={() => void refreshAllLocalesFromDatabase()}
                  aria-label={t('reload')}
                >
                  <RefreshCw
                    className={cn('h-4 w-4', refreshing && 'animate-spin')}
                  />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAddLineOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addItem')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setResetOpen(true)}
                >
                  {t('reload')}
                </Button>
              </div>

              <Button
                type="button"
                variant="accent"
                disabled={saving || refreshing}
                onClick={() => void handleSave()}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saving ? t('saving') : t('save')}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {t.rich('hint', {
                code: (chunks) => (
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">
                    {chunks}
                  </code>
                ),
              })}
            </p>

            <SiteCopyAiPanel
              activeTab={activeTab}
              locale={locale}
              sourceLocale={sourceLocale}
              sourceLines={sourceLines}
              exampleLines={currentDrafts
                .filter((item) => item.content.trim())
                .map((item) => item.content)}
              selectedLine={
                selectedIndex !== null
                  ? (currentDrafts[selectedIndex]?.content ?? null)
                  : null
              }
              disabled={refreshing || saving}
              onGenerated={appendGeneratedLines}
              onTranslated={replaceWithTranslatedLines}
              onImproved={improveSelectedLine}
            />

            <div className="space-y-3">
              {currentDrafts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-10 text-center">
                  <Terminal className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">{t('emptyList')}</p>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    className="mt-4"
                    onClick={() => setAddLineOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addItem')}
                  </Button>
                </div>
              ) : (
                visibleDrafts.map((item, visibleIndex) => {
                  const index = (listPage - 1) * listLimit + visibleIndex;
                  return (
                  <div
                    key={item.localId}
                    className={cn(
                      'rounded-2xl border p-4 transition-all',
                      selectedIndex === index
                        ? 'border-teal-500/40 bg-teal-500/5 shadow-sm'
                        : 'border-border/60 bg-background/40',
                      !item.isActive && 'opacity-60'
                    )}
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="font-mono text-[11px]"
                        >
                          #{index + 1}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.isActive}
                              onChange={(event) => {
                                const checked = event.target.checked;
                                setCurrentDrafts((items) =>
                                  items.map((draft, draftIndex) =>
                                    draftIndex === index
                                      ? { ...draft, isActive: checked }
                                      : draft
                                  )
                                );
                              }}
                              className="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500/30"
                            />
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {item.isActive ? (
                                <Eye className="h-3.5 w-3.5" />
                              ) : (
                                <EyeOff className="h-3.5 w-3.5" />
                              )}
                              {t('active')}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={index === 0}
                          onClick={() => moveItem(index, -1)}
                          aria-label={t('moveUp')}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={index === currentDrafts.length - 1}
                          onClick={() => moveItem(index, 1)}
                          aria-label={t('moveDown')}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setCurrentDrafts((items) =>
                              items.filter((_, draftIndex) => draftIndex !== index)
                            );
                            setSelectedIndex((prev) =>
                              prev === index ? null : prev
                            );
                          }}
                          aria-label={t('remove')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={item.content}
                      onFocus={() => setSelectedIndex(index)}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCurrentDrafts((items) =>
                          items.map((draft, draftIndex) =>
                            draftIndex === index
                              ? { ...draft, content: value }
                              : draft
                          )
                        );
                      }}
                      rows={3}
                      placeholder={t('contentPlaceholder')}
                      className="font-mono text-[13px] leading-relaxed"
                    />
                  </div>
                  );
                })
              )}
            </div>

            <DataPagination
              pagination={listPagination}
              onPageChange={setListPage}
              onLimitChange={(nextLimit) => {
                setListLimit(nextLimit);
                setListPage(1);
              }}
            />

          </AdminListCard>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <AdminListCard className="space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-teal-500" />
              <h3 className="text-sm font-semibold">{t('previewTitle')}</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('previewDescription')}
            </p>
            <TerminalCard fileName={previewFile}>
              <div className="flex min-h-[4.5rem] items-start gap-2">
                <span
                  className="select-none pt-px font-mono text-sm text-teal-400"
                  aria-hidden
                >
                  &gt;
                </span>
                <p className="font-mono text-[13px] leading-relaxed text-slate-200 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:text-teal-300">
                  {previewLine ? (
                    <>
                      <span dangerouslySetInnerHTML={{ __html: previewLine }} />
                      <TerminalCursor />
                    </>
                  ) : (
                    <span className="text-slate-500">{t('previewEmpty')}</span>
                  )}
                </p>
              </div>
            </TerminalCard>
          </AdminListCard>

          <AdminListCard className="space-y-2 text-sm">
            <p className="font-medium">{t('tipsPanel.title')}</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>{t('tipsPanel.selectLine')}</li>
              <li>{t('tipsPanel.translate')}</li>
              <li>{t('tipsPanel.save')}</li>
            </ul>
          </AdminListCard>
        </aside>
      </div>

      <AddSiteCopyLineDialog
        open={addLineOpen}
        onOpenChange={setAddLineOpen}
        onSubmit={handleAddLine}
        activeTab={activeTab}
        exampleLinesByLocale={Object.fromEntries(
          locales.map((code) => {
            const store =
              activeTab === 'TIP' ? tipsByLocale[code] : mottosByLocale[code];
            return [
              code,
              (store ?? [])
                .filter((item) => item.content.trim())
                .map((item) => item.content),
            ];
          })
        )}
        disabled={refreshing || saving}
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={t('reloadTitle')}
        description={t('reloadConfirm')}
        confirmLabel={t('reload')}
        cancelLabel={t('cancel')}
        destructive={false}
        confirmVariant="accent"
        onConfirm={() => {
          void refreshAllLocalesFromDatabase();
          setResetOpen(false);
        }}
      />
    </div>
  );
}
