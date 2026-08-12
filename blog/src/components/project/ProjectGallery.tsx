'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Images } from 'lucide-react';
import BlogImage from '@/components/blog/BlogImage';
import { ImageLightbox } from '@/components/media/image-lightbox';
import { cn } from '@/lib/utils';

type ProjectGalleryProps = {
  images: string[];
  title: string;
};

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const t = useTranslations('Pages.Project');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const openAt = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  if (images.length === 0) {
    return null;
  }

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

      <ImageLightbox
        open={activeIndex !== null}
        images={images}
        activeIndex={activeIndex ?? 0}
        title={title}
        imageAlt={(index) => t('galleryImageAlt', { title, index: index + 1 })}
        onClose={close}
        onIndexChange={setActiveIndex}
      />
    </>
  );
}
