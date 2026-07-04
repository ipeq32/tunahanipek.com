'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { useHorizontalDragScroll } from '@/hooks/use-horizontal-drag-scroll';

type HorizontalMediaCarouselProps = {
  itemCount: number;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  className?: string;
  slideClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function HorizontalMediaCarousel({
  itemCount,
  activeIndex,
  onActiveIndexChange,
  className,
  slideClassName,
  children,
  footer,
}: HorizontalMediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollSourceRef = useRef<'user' | 'external'>('external');
  const [scrollReady, setScrollReady] = useState(false);

  useHorizontalDragScroll(scrollRef, { enabled: itemCount > 1 });

  const syncIndexFromScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element || element.clientWidth <= 0) {
      return;
    }

    const nextIndex = Math.round(element.scrollLeft / element.clientWidth);
    const clamped = Math.max(0, Math.min(itemCount - 1, nextIndex));

    if (clamped !== activeIndex) {
      scrollSourceRef.current = 'user';
      onActiveIndexChange(clamped);
    }
  }, [activeIndex, itemCount, onActiveIndexChange]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const handleScroll = () => {
      window.requestAnimationFrame(syncIndexFromScroll);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    setScrollReady(true);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [syncIndexFromScroll]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !scrollReady || itemCount <= 1) {
      return;
    }

    if (scrollSourceRef.current === 'user') {
      scrollSourceRef.current = 'external';
      return;
    }

    const targetLeft = activeIndex * element.clientWidth;
    if (Math.abs(element.scrollLeft - targetLeft) > 2) {
      element.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  }, [activeIndex, itemCount, scrollReady]);

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        ref={scrollRef}
        className={cn(
          'flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain',
          'touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none]',
          '[&::-webkit-scrollbar]:hidden',
          slideClassName,
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
        aria-roledescription="carousel"
        aria-live="polite"
      >
        {children}
      </div>

      {itemCount > 1 && (
        <div className="flex items-center justify-center gap-1.5 px-1">
          {Array.from({ length: itemCount }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Slide ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => onActiveIndexChange(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === activeIndex
                  ? 'w-5 bg-teal-500'
                  : 'w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground/55',
              )}
            />
          ))}
        </div>
      )}

      {footer}
    </div>
  );
}

type HorizontalMediaCarouselSlideProps = {
  children: ReactNode;
  className?: string;
};

export function HorizontalMediaCarouselSlide({
  children,
  className,
}: HorizontalMediaCarouselSlideProps) {
  return (
    <div
      className={cn(
        'w-full shrink-0 snap-center snap-always',
        className,
      )}
    >
      {children}
    </div>
  );
}
