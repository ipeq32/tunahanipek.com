'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Images, Loader2, X } from 'lucide-react';
import BlogImage from '@/components/blog/BlogImage';
import { cn } from '@/lib/utils';

type ProjectGalleryProps = {
  images: string[];
  title: string;
};

const SWIPE_OFFSET_PX = 56;
const SWIPE_VELOCITY = 420;
const SLIDE_GAP_PX = 14;
const PEEK_PX_MOBILE = 36;
const PEEK_PX_DESKTOP = 52;

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

type LightboxImageProps = {
  src: string;
  alt: string;
};

type LightboxCarouselProps = {
  images: string[];
  activeIndex: number;
  reduceMotion: boolean | null;
  onGoTo: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  imageAlt: (index: number) => string;
};

function LightboxCarousel({
  images,
  activeIndex,
  reduceMotion,
  onGoTo,
  onPrev,
  onNext,
  imageAlt,
}: LightboxCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [peekPx, setPeekPx] = useState(PEEK_PX_MOBILE);
  const x = useMotionValue(0);
  const skipAnimationRef = useRef(true);

  const slideWidth =
    containerWidth > 0 ? Math.max(containerWidth - peekPx * 2, 0) : 0;
  const stride = slideWidth + SLIDE_GAP_PX;
  const targetX = stride > 0 ? peekPx - activeIndex * stride : 0;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const updateLayout = () => {
      const width = node.clientWidth;
      setContainerWidth(width);
      setPeekPx(width >= 768 ? PEEK_PX_DESKTOP : PEEK_PX_MOBILE);
    };

    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (stride <= 0) {
      return;
    }

    if (skipAnimationRef.current || reduceMotion) {
      x.set(targetX);
      skipAnimationRef.current = false;
      return;
    }

    const controls = animate(x, targetX, {
      type: 'spring',
      stiffness: 380,
      damping: 36,
      mass: 0.82,
    });

    return () => controls.stop();
  }, [reduceMotion, stride, targetX, x]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (stride <= 0) {
      return;
    }

    if (info.offset.x > SWIPE_OFFSET_PX || info.velocity.x > SWIPE_VELOCITY) {
      onPrev();
      return;
    }

    if (info.offset.x < -SWIPE_OFFSET_PX || info.velocity.x < -SWIPE_VELOCITY) {
      onNext();
      return;
    }

    if (reduceMotion) {
      x.set(targetX);
      return;
    }

    animate(x, targetX, {
      type: 'spring',
      stiffness: 380,
      damping: 36,
      mass: 0.82,
    });
  };

  if (images.length === 1) {
    return (
      <div ref={containerRef} className="h-full w-full">
        <LightboxImage src={images[0]} alt={imageAlt(0)} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <motion.div
        className="flex h-full cursor-grab items-center active:cursor-grabbing"
        style={{ x, gap: SLIDE_GAP_PX }}
        drag={reduceMotion ? false : 'x'}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        {images.map((src, index) => {
          const isActive = index === activeIndex;

          return (
            <motion.div
              key={`${src}-${index}`}
              className={cn(
                'relative h-[88%] shrink-0 overflow-hidden rounded-2xl bg-neutral-950 ring-1 transition-shadow duration-300 sm:h-[90%]',
                isActive
                  ? 'shadow-2xl shadow-black/60 ring-white/15'
                  : 'shadow-lg shadow-black/30 ring-white/5',
              )}
              style={{ width: slideWidth > 0 ? slideWidth : '84%' }}
              animate={{
                scale: isActive ? 1 : 0.94,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{
                duration: reduceMotion ? 0.05 : 0.22,
                ease: 'easeOut',
              }}
              onClick={() => {
                if (!isActive) {
                  onGoTo(index);
                }
              }}
            >
              <LightboxImage src={src} alt={imageAlt(index)} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function LightboxImage({ src, alt }: LightboxImageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {!loaded && (
        <div
          className="absolute inset-4 flex items-center justify-center rounded-2xl bg-neutral-900 ring-1 ring-white/10 sm:inset-8"
          aria-hidden
        >
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      )}
      <div
        className={cn(
          'relative h-full w-full transition-opacity duration-300',
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
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const goTo = useCallback((nextIndex: number) => {
    setActiveIndex(nextIndex);
  }, []);

  const showPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) {
        return null;
      }

      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) {
        return null;
      }

      return (current + 1) % images.length;
    });
  }, [images.length]);

  const openAt = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useAdjacentPreload(images, activeIndex);
  useLightboxScrollLock(activeIndex !== null);

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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, close, showNext, showPrev]);

  if (images.length === 0) {
    return null;
  }

  const lightbox =
    activeIndex !== null ? (
      <div
        className="fixed inset-0 z-[9999] isolate flex h-[100dvh] w-screen flex-col bg-black text-white"
        role="dialog"
        aria-modal="true"
        aria-label={t('galleryLightboxLabel', { title })}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-black"
          aria-hidden
        />

        <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
          <div className="min-w-0 flex-1 pr-2">
            <p className="truncate text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-white/60">
              {activeIndex + 1} / {images.length}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="pointer-events-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 active:scale-95"
            aria-label={t('galleryClose')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="relative z-10 min-h-0 flex-1 overscroll-none"
          style={{ touchAction: 'pan-x' }}
        >
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/25 active:scale-95 md:inline-flex"
                aria-label={t('galleryPrev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/25 active:scale-95 md:inline-flex"
                aria-label={t('galleryNext')}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="absolute inset-0 py-2">
            <LightboxCarousel
              images={images}
              activeIndex={activeIndex}
              reduceMotion={reduceMotion}
              onGoTo={goTo}
              onPrev={showPrev}
              onNext={showNext}
              imageAlt={(index) =>
                t('galleryImageAlt', {
                  title,
                  index: index + 1,
                })
              }
            />
          </div>
        </div>

        {images.length > 1 && (
          <div className="relative z-10 shrink-0 border-t border-white/10 bg-black px-3 py-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] md:py-4">
            <div className="flex items-center gap-2.5 md:hidden">
              <button
                type="button"
                onClick={showPrev}
                className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/12 text-sm font-medium text-white ring-1 ring-white/15 active:scale-[0.98] active:bg-white/20"
                aria-label={t('galleryPrev')}
              >
                <ChevronLeft className="h-5 w-5 shrink-0" />
                <span className="truncate">{t('galleryPrev')}</span>
              </button>
              <button
                type="button"
                onClick={showNext}
                className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/12 text-sm font-medium text-white ring-1 ring-white/15 active:scale-[0.98] active:bg-white/20"
                aria-label={t('galleryNext')}
              >
                <span className="truncate">{t('galleryNext')}</span>
                <ChevronRight className="h-5 w-5 shrink-0" />
              </button>
            </div>
            <div className="mt-3 flex justify-center gap-1.5 overflow-x-auto px-1 md:mt-0">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    'h-2 shrink-0 rounded-full transition-all',
                    index === activeIndex
                      ? 'w-7 bg-teal-400'
                      : 'w-2 bg-white/35 hover:bg-white/50 active:bg-white/55',
                  )}
                  aria-label={t('galleryImageAlt', {
                    title,
                    index: index + 1,
                  })}
                  aria-current={index === activeIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    ) : null;

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
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70 md:opacity-0 md:transition-opacity md:group-hover:opacity-100" />
              <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                {t('galleryExpand')}
              </span>
            </button>
          ))}
        </div>
      </section>

      {mounted && lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}
