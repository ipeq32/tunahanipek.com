import { useCallback, useEffect, useRef } from 'react';

const LOGO_ANIMATION_MS = 200;

export function useTapLogoAnimation(activeClassName = 'logo-brand-animated') {
  const elementRef = useRef<HTMLButtonElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playAnimation = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    element.classList.add(activeClassName);

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      element.classList.remove(activeClassName);
      resetTimerRef.current = null;
    }, LOGO_ANIMATION_MS);
  }, [activeClassName]);

  useEffect(
    () => () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  return { elementRef, playAnimation };
}
