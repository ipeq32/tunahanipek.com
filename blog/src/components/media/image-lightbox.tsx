'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import {
  ZoomableImage,
  type ZoomableImageControls,
} from '@/components/media/zoomable-image';
import { cn } from '@/lib/utils';

type ImageLightboxProps = {
  open: boolean;
  images: string[];
  activeIndex: number;
  title?: string;
  imageAlt: (index: number) => string;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
};

function useLightboxScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.touchAction = 'none';

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.touchAction = previousBodyTouchAction;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

function preloadImage(url: string) {
  const img = new window.Image();
  img.decoding = 'async';
  img.src = url;
}

export function ImageLightbox({
  open,
  images,
  activeIndex,
  title,
  imageAlt,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const t = useTranslations('Ui.Lightbox');
  const [mounted, setMounted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomControls, setZoomControls] =
    useState<ZoomableImageControls | null>(null);

  const hasMultiple = images.length > 1;
  const safeIndex =
    images.length === 0
      ? 0
      : Math.min(Math.max(activeIndex, 0), images.length - 1);

  const goTo = useCallback(
    (index: number) => {
      if (!hasMultiple) {
        return;
      }
      const next = (index + images.length) % images.length;
      onIndexChange?.(next);
    },
    [hasMultiple, images.length, onIndexChange],
  );

  const showPrev = useCallback(() => {
    goTo(safeIndex - 1);
  }, [goTo, safeIndex]);

  const showNext = useCallback(() => {
    goTo(safeIndex + 1);
  }, [goTo, safeIndex]);

  const handleSwipe = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
        showPrev();
        return;
      }
      showNext();
    },
    [showNext, showPrev],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useLightboxScrollLock(open);

  useEffect(() => {
    if (!open || images.length === 0) {
      return;
    }

    preloadImage(images[safeIndex]);
    if (hasMultiple) {
      preloadImage(images[(safeIndex + 1) % images.length]);
      preloadImage(images[(safeIndex - 1 + images.length) % images.length]);
    }
  }, [hasMultiple, images, open, safeIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowLeft') {
        showPrev();
      }
      if (event.key === 'ArrowRight') {
        showNext();
      }
      if (event.key === '+' || event.key === '=') {
        zoomControls?.zoomIn();
      }
      if (event.key === '-' || event.key === '_') {
        zoomControls?.zoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open, showNext, showPrev, zoomControls]);

  useEffect(() => {
    setIsZoomed(false);
  }, [safeIndex, open]);

  if (!mounted || !open || images.length === 0) {
    return null;
  }

  const currentSrc = images[safeIndex];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] isolate flex h-[100dvh] w-screen flex-col overflow-hidden overscroll-none bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label={title ? t('labelWithTitle', { title }) : t('label')}
    >
      <div
        className="relative z-20 flex shrink-0 items-center gap-2 border-b border-white/10 bg-black/90 px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pb-3 [@media(orientation:landscape)_and_(max-height:520px)]:py-1.5 [@media(orientation:landscape)_and_(max-height:520px)]:pt-[max(0.35rem,env(safe-area-inset-top))]"
      >
        <div className="min-w-0 flex-1 pr-1">
          {title ? (
            <p className="truncate text-sm font-medium text-white [@media(orientation:landscape)_and_(max-height:520px)]:hidden">
              {title}
            </p>
          ) : null}
          <p className="text-xs text-white/60">
            {hasMultiple ? `${safeIndex + 1} / ${images.length}` : t('hint')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => zoomControls?.zoomOut()}
            disabled={!zoomControls?.canZoomOut}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 disabled:opacity-40"
            aria-label={t('zoomOut')}
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => zoomControls?.zoomIn()}
            disabled={!zoomControls?.canZoomIn}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 disabled:opacity-40"
            aria-label={t('zoomIn')}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 active:scale-95"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative z-10 min-h-0 flex-1">
        {hasMultiple && !isZoomed && (
          <>
            <button
              type="button"
              onClick={showPrev}
              className="absolute left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/25 md:inline-flex"
              aria-label={t('prev')}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/25 md:inline-flex"
              aria-label={t('next')}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div className="absolute inset-0">
          <ZoomableImage
            key={`${safeIndex}-${currentSrc}`}
            src={currentSrc}
            alt={imageAlt(safeIndex)}
            onSwipe={hasMultiple ? handleSwipe : undefined}
            onZoomChange={setIsZoomed}
            onControlsChange={setZoomControls}
          />
        </div>
      </div>

      {hasMultiple && (
        <div className="relative z-20 shrink-0 border-t border-white/10 bg-black/90 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] [@media(orientation:landscape)_and_(max-height:520px)]:py-2 [@media(orientation:landscape)_and_(max-height:520px)]:pb-[max(0.4rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2.5 md:hidden [@media(orientation:landscape)_and_(max-height:520px)]:hidden">
            <button
              type="button"
              onClick={showPrev}
              disabled={isZoomed}
              className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/12 text-sm font-medium text-white ring-1 ring-white/15 active:scale-[0.98] disabled:opacity-40"
              aria-label={t('prev')}
            >
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span className="truncate">{t('prev')}</span>
            </button>
            <button
              type="button"
              onClick={showNext}
              disabled={isZoomed}
              className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/12 text-sm font-medium text-white ring-1 ring-white/15 active:scale-[0.98] disabled:opacity-40"
              aria-label={t('next')}
            >
              <span className="truncate">{t('next')}</span>
              <ChevronRight className="h-5 w-5 shrink-0" />
            </button>
          </div>
          <div
            className={cn(
              'flex justify-center gap-1.5 overflow-x-auto px-1',
              'md:mt-0 [@media(orientation:landscape)_and_(max-height:520px)]:mt-0',
              'max-md:mt-3 [@media(orientation:landscape)_and_(max-height:520px)]:max-md:mt-0',
            )}
          >
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  'h-2 shrink-0 rounded-full transition-all',
                  index === safeIndex
                    ? 'w-7 bg-teal-400'
                    : 'w-2 bg-white/35 hover:bg-white/50',
                )}
                aria-label={imageAlt(index)}
                aria-current={index === safeIndex ? 'true' : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
