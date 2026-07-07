'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Images, Loader2, X } from 'lucide-react';
import BlogImage from '@/components/blog/BlogImage';
import { cn } from '@/lib/utils';

type ProjectGalleryProps = {
  images: string[];
  title: string;
};

const SWIPE_THRESHOLD_PX = 48;
const SWIPE_MAX_ANGLE_RATIO = 1.25;

function preloadImage(url: string) {
  const img = new window.Image();
  img.decoding = 'async';
  img.src = url;
}

function useAdjacentPreload(images: string[], activeIndex: number | null) {
  useEffect(() => {
    if (activeIndex === null || images.length === 0) {
      return;
    }

    preloadImage(images[activeIndex]);

    if (images.length > 1) {
      preloadImage(images[(activeIndex + 1) % images.length]);
      preloadImage(images[(activeIndex - 1 + images.length) % images.length]);
    }
  }, [activeIndex, images]);
}

type LightboxImageProps = {
  src: string;
  alt: string;
};

function LightboxImage({ src, alt }: LightboxImageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {!loaded && (
        <div
          className="absolute inset-6 flex items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 sm:inset-10"
          aria-hidden
        >
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      )}
      <div
        className={cn(
          'relative h-full w-full max-h-full transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      >
        <BlogImage
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          quality={82}
          priority
          draggable={false}
          className="pointer-events-none select-none object-contain"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const t = useTranslations('Pages.Project');
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const goTo = useCallback(
    (nextIndex: number) => {
      setActiveIndex((current) => {
        if (current === null) {
          return nextIndex;
        }

        const delta = nextIndex - current;
        setSlideDirection(delta >= 0 ? 1 : -1);
        return nextIndex;
      });
    },
    [],
  );

  const showPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) {
        return null;
      }

      setSlideDirection(-1);
      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) {
        return null;
      }

      setSlideDirection(1);
      return (current + 1) % images.length;
    });
  }, [images.length]);

  const openAt = useCallback((index: number) => {
    setSlideDirection(0);
    setActiveIndex(index);
  }, []);

  useAdjacentPreload(images, activeIndex);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
      if (event.key === 'ArrowLeft') {
        showPrev();
      }
      if (event.key === 'ArrowRight') {
        showNext();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, close, showNext, showPrev]);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;

    if (!start || images.length < 2) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD_PX ||
      Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_MAX_ANGLE_RATIO
    ) {
      return;
    }

    if (deltaX > 0) {
      showPrev();
      return;
    }

    showNext();
  };

  if (images.length === 0) {
    return null;
  }

  const slideVariants = reduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (direction: number) => ({
          opacity: 0,
          x: direction >= 0 ? 72 : -72,
          scale: 0.98,
        }),
        center: {
          opacity: 1,
          x: 0,
          scale: 1,
        },
        exit: (direction: number) => ({
          opacity: 0,
          x: direction >= 0 ? -72 : 72,
          scale: 0.98,
        }),
      };

  return (
    <>
      <section className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-8 sm:py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Images className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              {t('galleryTitle')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('gallerySubtitle')}</p>
          </div>
        </div>

        <div
          className={cn(
            'grid gap-2.5 p-3 sm:gap-4 sm:p-6',
            images.length === 1 && 'grid-cols-1',
            images.length === 2 && 'grid-cols-2',
            images.length >= 3 && 'grid-cols-2 md:grid-cols-3',
          )}
        >
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => openAt(index)}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border/50 bg-muted/20 shadow-sm transition hover:border-teal-500/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 active:scale-[0.99]',
                images.length === 1 && 'aspect-[16/10]',
                images.length === 2 && 'aspect-[4/3]',
                images.length >= 3 &&
                  (index === 0
                    ? 'aspect-[16/10] md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[280px]'
                    : 'aspect-[4/3]'),
              )}
            >
              <BlogImage
                src={src}
                alt={t('galleryImageAlt', { title, index: index + 1 })}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 400px"
                quality={72}
                priority={index === 0}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100" />
              <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                {t('galleryExpand')}
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[220] flex flex-col bg-black/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={t('galleryLightboxLabel', { title })}
        >
          <div className="relative z-30 flex shrink-0 items-center justify-between gap-3 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
            <div className="min-w-0 flex-1 pr-2">
              <p className="truncate text-sm font-medium text-white/90">{title}</p>
              <p className="text-xs text-white/55">
                {activeIndex + 1} / {images.length}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
              aria-label={t('galleryClose')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className="relative z-20 min-h-0 flex-1 touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  className="absolute left-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/60 active:scale-95 sm:inline-flex md:left-5"
                  aria-label={t('galleryPrev')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/60 active:scale-95 sm:inline-flex md:right-5"
                  aria-label={t('galleryNext')}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute inset-0 px-1 sm:px-8 sm:pb-4">
              <AnimatePresence mode="wait" custom={slideDirection}>
                <motion.div
                  key={activeIndex}
                  custom={slideDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: 'easeOut' }}
                  className="relative h-full w-full"
                >
                  <LightboxImage
                    src={images[activeIndex]}
                    alt={t('galleryImageAlt', {
                      title,
                      index: activeIndex + 1,
                    })}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {images.length > 1 && (
            <div className="relative z-30 shrink-0 border-t border-white/10 bg-black/40 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={showPrev}
                  className="inline-flex h-12 min-w-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 text-sm font-medium text-white ring-1 ring-white/10 transition active:scale-[0.98] active:bg-white/15"
                  aria-label={t('galleryPrev')}
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>{t('galleryPrev')}</span>
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="inline-flex h-12 min-w-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 text-sm font-medium text-white ring-1 ring-white/10 transition active:scale-[0.98] active:bg-white/15"
                  aria-label={t('galleryNext')}
                >
                  <span>{t('galleryNext')}</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 flex justify-center gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goTo(index)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      index === activeIndex
                        ? 'w-6 bg-teal-400'
                        : 'w-1.5 bg-white/35 hover:bg-white/55',
                    )}
                    aria-label={t('galleryImageAlt', {
                      title,
                      index: index + 1,
                    })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
