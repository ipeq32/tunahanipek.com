'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import BlogImage from '@/components/blog/BlogImage';
import { cn } from '@/lib/utils';

type ProjectGalleryProps = {
  images: string[];
  title: string;
};

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const t = useTranslations('Pages.Project');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') showPrev();
      if (event.key === 'ArrowRight') showNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, close, showNext, showPrev]);

  if (images.length === 0) return null;

  return (
    <>
      <section className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 px-6 py-5 sm:px-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Images className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              {t('galleryTitle')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('gallerySubtitle')}</p>
          </div>
        </div>

        <div
          className={cn(
            'grid gap-3 p-4 sm:gap-4 sm:p-6',
            images.length === 1 && 'grid-cols-1',
            images.length === 2 && 'grid-cols-2',
            images.length >= 3 && 'grid-cols-2 md:grid-cols-3',
          )}
        >
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border/50 bg-muted/20 shadow-sm transition hover:border-teal-500/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50',
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
                quality={90}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                {t('galleryExpand')}
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t('galleryLightboxLabel', { title })}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label={t('galleryClose')}
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
                aria-label={t('galleryPrev')}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
                aria-label={t('galleryNext')}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="relative h-full max-h-[85vh] w-full max-w-5xl"
            onClick={close}
          >
            <div
              className="relative mx-auto h-full w-full"
              onClick={(event) => event.stopPropagation()}
            >
              <BlogImage
                src={images[activeIndex]}
                alt={t('galleryImageAlt', {
                  title,
                  index: activeIndex + 1,
                })}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                quality={95}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
