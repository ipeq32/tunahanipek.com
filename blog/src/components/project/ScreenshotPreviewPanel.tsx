'use client';

import { Check, ImageIcon, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MediaPreviewImage } from '@/components/ui/media-preview-image';
import {
  HorizontalMediaCarousel,
  HorizontalMediaCarouselSlide,
} from '@/components/ui/horizontal-media-carousel';
import { Button } from '@/components/ui/button';
import { useHorizontalDragScroll } from '@/hooks/use-horizontal-drag-scroll';
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
  const images = useMemo(
    () => [...new Set([coverUrl, ...gallery])],
    [coverUrl, gallery],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(() => new Set());
  const thumbScrollRef = useRef<HTMLDivElement>(null);

  useHorizontalDragScroll(thumbScrollRef, { enabled: images.length > 1 });

  useEffect(() => {
    setLoadedUrls(new Set());
    setActiveIndex(0);
  }, [images]);

  const readyCount = images.filter((url) => loadedUrls.has(url)).length;
  const total = images.length;
  const allReady = total === 0 || readyCount >= total;

  const markReady = (url: string) => {
    setLoadedUrls((current) => {
      if (current.has(url)) return current;
      const next = new Set(current);
      next.add(url);
      return next;
    });
  };

  const scrollThumbIntoView = (index: number) => {
    const container = thumbScrollRef.current;
    const thumb = container?.children.item(index);
    if (!(container instanceof HTMLElement) || !(thumb instanceof HTMLElement)) {
      return;
    }

    thumb.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  const handleActiveIndexChange = (index: number) => {
    setActiveIndex(index);
    scrollThumbIntoView(index);
  };

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
        <HorizontalMediaCarousel
          itemCount={images.length}
          activeIndex={activeIndex}
          onActiveIndexChange={handleActiveIndexChange}
          slideClassName="rounded-xl"
        >
          {images.map((url, index) => {
            const isCover = url === coverUrl;

            return (
              <HorizontalMediaCarouselSlide key={url}>
                <div
                  className={cn(
                    'relative aspect-[16/10] overflow-hidden rounded-xl border border-border/50',
                    'bg-muted/30 shadow-inner ring-1 ring-black/5 dark:ring-white/5',
                  )}
                >
                  <MediaPreviewImage
                    src={url}
                    alt={t('previewAlt', { index: index + 1 })}
                    sizes="(max-width: 640px) 100vw, 1120px"
                    quality={92}
                    priority={index === 0}
                    imageClassName="object-cover object-top"
                    onReady={() => markReady(url)}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  {isCover && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                      <ImageIcon className="h-3.5 w-3.5" />
                      {t('coverBadge')}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md">
                    {index + 1} / {images.length}
                  </span>
                  {!allReady && index === 0 && (
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
              </HorizontalMediaCarouselSlide>
            );
          })}
        </HorizontalMediaCarousel>

        {images.length > 1 && (
          <div className="relative -mx-1">
            <div
              ref={thumbScrollRef}
              className={cn(
                'flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1',
                'touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none]',
                '[&::-webkit-scrollbar]:hidden',
              )}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {images.map((url, index) => {
                const isActive = index === activeIndex;
                const isCover = url === coverUrl;

                return (
                  <button
                    key={url}
                    type="button"
                    aria-label={t('previewAlt', { index: index + 1 })}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => handleActiveIndexChange(index)}
                    className={cn(
                      'relative aspect-[4/3] w-[28%] min-w-[5.5rem] shrink-0 snap-start overflow-hidden rounded-lg border bg-muted/30 shadow-sm ring-1 transition',
                      isActive
                        ? 'border-teal-500/60 ring-teal-500/25'
                        : 'border-border/50 ring-black/5 hover:border-teal-500/35 dark:ring-white/5',
                    )}
                  >
                    <MediaPreviewImage
                      src={url}
                      alt={t('previewAlt', { index: index + 1 })}
                      sizes="200px"
                      quality={90}
                      onReady={() => markReady(url)}
                    />
                    {isCover && (
                      <span className="pointer-events-none absolute left-1 top-1 rounded bg-black/55 px-1 py-0.5 text-[9px] font-medium text-white">
                        {t('coverBadge')}
                      </span>
                    )}
                  </button>
                );
              })}
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
