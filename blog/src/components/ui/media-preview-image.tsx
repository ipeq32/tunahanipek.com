'use client';

import { useEffect, useState } from 'react';
import BlogImage from '@/components/blog/BlogImage';
import { cn } from '@/lib/utils';

type MediaPreviewImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onReady?: () => void;
};

export function MediaPreviewImage({
  src,
  alt,
  className,
  imageClassName,
  sizes,
  priority = false,
  quality = 92,
  onReady,
}: MediaPreviewImageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {!loaded && (
        <div
          className="absolute inset-0 bg-muted/50"
          aria-hidden
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
          </div>
        </div>
      )}

      <BlogImage
        key={src}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        className={cn(
          'object-cover transition-[opacity,transform] duration-500 ease-out',
          loaded ? 'scale-100 opacity-100' : 'scale-[1.02] opacity-0',
          imageClassName,
        )}
        onLoad={() => {
          setLoaded(true);
          onReady?.();
        }}
      />
    </div>
  );
}
