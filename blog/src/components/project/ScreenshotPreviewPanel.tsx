'use client';

import { Check, ImageIcon, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MediaPreviewImage } from '@/components/ui/media-preview-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ScreenshotPreviewPanelProps = {
  coverUrl: string;
  gallery: string[];
  pageTitle: string;
  disabled?: boolean;
  onApply: () => void;
  onDiscard: () => void;
};

export function ScreenshotPreviewPanel({
  coverUrl,
  gallery,
  pageTitle,
  disabled,
  onApply,
  onDiscard,
}: ScreenshotPreviewPanelProps) {
  const t = useTranslations('Content.ProjectScreenshots');
  const allUrls = useMemo(
    () => [...new Set([coverUrl, ...gallery])],
    [coverUrl, gallery],
  );
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setLoadedUrls(new Set());
  }, [allUrls]);

  const readyCount = allUrls.filter((url) => loadedUrls.has(url)).length;
  const total = allUrls.length;
  const allReady = total === 0 || readyCount >= total;

  const markReady = (url: string) => {
    setLoadedUrls((current) => {
      if (current.has(url)) return current;
      const next = new Set(current);
      next.add(url);
      return next;
    });
  };

  const thumbnails = gallery.filter((url) => url !== coverUrl);

  return (
    <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-lg shadow-black/5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-muted/20 px-4 py-3">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium text-foreground">
            {pageTitle || t('previewUntitled')}
          </p>
          <p className="text-xs text-muted-foreground">
            {allReady
              ? t('previewReady', { count: gallery.length })
              : t('imagesLoading', { loaded: readyCount, total })}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-teal-500/25 bg-teal-500/10 px-2.5 py-1 text-[11px] font-medium text-teal-700 dark:text-teal-300">
          <Sparkles className="h-3.5 w-3.5" />
          {t('aiSelected', { count: gallery.length })}
        </span>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        <div
          className={cn(
            'relative aspect-[16/10] overflow-hidden rounded-xl border border-border/50',
            'bg-muted/30 shadow-inner ring-1 ring-black/5 dark:ring-white/5',
          )}
        >
          <MediaPreviewImage
            src={coverUrl}
            alt={t('previewAlt', { index: 1 })}
            sizes="(max-width: 640px) 100vw, 560px"
            priority
            imageClassName="object-cover object-top"
            onReady={() => markReady(coverUrl)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <ImageIcon className="h-3.5 w-3.5" />
            {t('coverBadge')}
          </span>
          {!allReady && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
              <div
                className="h-full bg-teal-500 transition-all duration-300 ease-out"
                style={{
                  width: total > 0 ? `${(readyCount / total) * 100}%` : '0%',
                }}
              />
            </div>
          )}
        </div>

        {thumbnails.length > 0 && (
          <div className="relative -mx-1">
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
              {thumbnails.map((url, index) => (
                <div
                  key={url}
                  className={cn(
                    'relative aspect-[4/3] w-[28%] min-w-[5.5rem] shrink-0 snap-start overflow-hidden',
                    'rounded-lg border border-border/50 bg-muted/30 shadow-sm',
                    'ring-1 ring-black/5 transition hover:border-teal-500/35 hover:ring-teal-500/15 dark:ring-white/5',
                  )}
                >
                  <MediaPreviewImage
                    src={url}
                    alt={t('previewAlt', { index: index + 2 })}
                    sizes="120px"
                    onReady={() => markReady(url)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border/40 pt-3">
          <Button
            type="button"
            size="sm"
            variant="accent"
            onClick={onApply}
            disabled={disabled || !allReady}
            className="min-w-[9rem]"
          >
            <Check className="h-4 w-4" />
            {allReady ? t('applyButton') : t('preparingApply')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onDiscard}
            disabled={disabled}
            className="bg-background/70"
          >
            <X className="h-4 w-4" />
            {t('discardButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}
