'use client';

import { useEffect, useState, type SyntheticEvent } from 'react';
import { Loader2 } from 'lucide-react';
import BlogImage from '@/components/blog/BlogImage';
import { useImageZoom } from '@/hooks/use-image-zoom';
import { fitSize, toTransformStyle, type Size } from '@/lib/image-zoom';
import { cn } from '@/lib/utils';

export type ZoomableImageControls = {
  zoomIn: () => void;
  zoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
};

type ZoomableImageProps = {
  src: string;
  alt: string;
  onSwipe?: (direction: 'prev' | 'next') => void;
  onZoomChange?: (isZoomed: boolean) => void;
  onControlsChange?: (controls: ZoomableImageControls) => void;
  className?: string;
};

export function ZoomableImage({
  src,
  alt,
  onSwipe,
  onZoomChange,
  onControlsChange,
  className,
}: ZoomableImageProps) {
  const isBlob = src.startsWith('blob:');
  const [natural, setNatural] = useState<Size>({ width: 0, height: 0 });
  const [fitted, setFitted] = useState<Size>({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);
  const zoom = useImageZoom({ onSwipe });
  const ready = fitted.width > 0 && fitted.height > 0;

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setNatural({ width: 0, height: 0 });
    zoom.reset();

    const image = new window.Image();
    image.decoding = 'async';
    image.onload = () => {
      if (cancelled || image.naturalWidth <= 0) {
        return;
      }
      setNatural({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, zoom.reset]);

  useEffect(() => {
    onZoomChange?.(zoom.isZoomed);
  }, [onZoomChange, zoom.isZoomed]);

  useEffect(() => {
    onControlsChange?.({
      zoomIn: zoom.zoomIn,
      zoomOut: zoom.zoomOut,
      canZoomIn: zoom.canZoomIn,
      canZoomOut: zoom.canZoomOut,
    });
  }, [
    onControlsChange,
    zoom.canZoomIn,
    zoom.canZoomOut,
    zoom.zoomIn,
    zoom.zoomOut,
  ]);

  useEffect(() => {
    const node = zoom.containerRef.current;
    if (!node) {
      return;
    }

    const updateLayout = () => {
      const rect = node.getBoundingClientRect();
      const container = { width: rect.width, height: rect.height };
      const nextFitted = fitSize(natural, container);
      setFitted(nextFitted);
      zoom.setLayout(nextFitted, container);
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(node);
    return () => observer.disconnect();
  }, [natural, zoom.setLayout]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    if (natural.width > 0) {
      return;
    }
    const image = event.currentTarget;
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      setNatural({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    }
  };

  return (
    <div
      ref={zoom.containerRef}
      className={cn(
        'relative h-full w-full select-none overflow-hidden overscroll-none',
        zoom.isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in',
        className,
      )}
      style={{ touchAction: 'none', WebkitUserSelect: 'none' }}
    >
      {!loaded && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          aria-hidden
        >
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      )}

      <div
        ref={zoom.stageRef}
        className="absolute inset-0 flex items-center justify-center will-change-transform"
        style={{
          transform: toTransformStyle({ scale: 1, x: 0, y: 0 }),
          transformOrigin: 'center center',
        }}
      >
        {isBlob ? (
          <img
            src={src}
            alt={alt}
            draggable={false}
            decoding="async"
            className={cn(
              'pointer-events-none select-none object-contain',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
            style={
              ready
                ? { width: fitted.width, height: fitted.height }
                : { maxWidth: '100%', maxHeight: '100%' }
            }
            onLoad={handleLoad}
          />
        ) : (
          <div
            className={cn(
              'relative',
              loaded ? 'opacity-100' : 'opacity-0',
              !ready && 'h-full w-full',
            )}
            style={
              ready
                ? { width: fitted.width, height: fitted.height }
                : undefined
            }
          >
            <BlogImage
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              quality={92}
              priority
              draggable={false}
              className="pointer-events-none select-none object-contain"
              onLoad={handleLoad}
            />
          </div>
        )}
      </div>
    </div>
  );
}
