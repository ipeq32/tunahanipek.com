'use client';

import { useEffect, useRef, type RefObject } from 'react';

type UseHorizontalDragScrollOptions = {
  enabled?: boolean;
};

export function useHorizontalDragScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseHorizontalDragScrollOptions = {},
) {
  const { enabled = true } = options;
  const dragState = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || event.pointerType !== 'mouse') {
        return;
      }

      dragState.current = {
        active: true,
        startX: event.clientX,
        scrollLeft: element.scrollLeft,
        moved: false,
      };

      element.setPointerCapture(event.pointerId);
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragState.current.active) {
        return;
      }

      const deltaX = event.clientX - dragState.current.startX;
      if (Math.abs(deltaX) > 4) {
        dragState.current.moved = true;
      }

      element.scrollLeft = dragState.current.scrollLeft - deltaX;
    };

    const endDrag = (event: PointerEvent) => {
      if (!dragState.current.active) {
        return;
      }

      dragState.current.active = false;
      element.releasePointerCapture(event.pointerId);
      element.style.cursor = 'grab';
      element.style.removeProperty('user-select');
    };

    const onClick = (event: MouseEvent) => {
      if (dragState.current.moved) {
        event.preventDefault();
        event.stopPropagation();
        dragState.current.moved = false;
      }
    };

    element.style.cursor = 'grab';
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', endDrag);
    element.addEventListener('pointercancel', endDrag);
    element.addEventListener('click', onClick, true);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', endDrag);
      element.removeEventListener('pointercancel', endDrag);
      element.removeEventListener('click', onClick, true);
      element.style.removeProperty('cursor');
      element.style.removeProperty('user-select');
    };
  }, [enabled, ref]);
}
