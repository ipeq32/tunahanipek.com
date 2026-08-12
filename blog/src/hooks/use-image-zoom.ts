'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clamp,
  clampTransform,
  distance,
  IMAGE_DOUBLE_TAP_SCALE,
  IMAGE_ZOOM_MAX,
  IMAGE_ZOOM_MIN,
  IMAGE_ZOOM_STEP,
  midpoint,
  toTransformStyle,
  zoomAroundPoint,
  type Point,
  type Size,
  type Transform,
} from '@/lib/image-zoom';

const SWIPE_OFFSET_PX = 64;
const SWIPE_VELOCITY = 0.42;
const DOUBLE_TAP_MS = 280;
const DOUBLE_TAP_DISTANCE = 30;
const TAP_MOVE_THRESHOLD = 12;
const ZOOMED_SCALE = 1.04;

type GestureMode = 'none' | 'pan' | 'pinch' | 'swipe';

type UseImageZoomOptions = {
  enabled?: boolean;
  onSwipe?: (direction: 'prev' | 'next') => void;
};

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

function clientPoint(touch: Pick<Touch, 'clientX' | 'clientY'>): Point {
  return { x: touch.clientX, y: touch.clientY };
}

export function useImageZoom({
  enabled = true,
  onSwipe,
}: UseImageZoomOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fittedRef = useRef<Size>({ width: 0, height: 0 });
  const containerSizeRef = useRef<Size>({ width: 0, height: 0 });
  const transformRef = useRef<Transform>(IDENTITY);
  const onSwipeRef = useRef(onSwipe);
  const [scale, setScale] = useState(1);

  onSwipeRef.current = onSwipe;

  const apply = useCallback(
    (next: Transform, options?: { clampPan?: boolean; syncState?: boolean }) => {
      const scaleValue = clamp(next.scale, IMAGE_ZOOM_MIN, IMAGE_ZOOM_MAX);
      const transform =
        options?.clampPan === false
          ? { scale: scaleValue, x: next.x, y: next.y }
          : clampTransform(
              { ...next, scale: scaleValue },
              fittedRef.current,
              containerSizeRef.current,
            );

      transformRef.current = transform;
      const stage = stageRef.current;
      if (stage) {
        stage.style.transform = toTransformStyle(transform);
      }
      if (options?.syncState) {
        setScale(transform.scale);
      }
    },
    [],
  );

  const setStageTransition = useCallback((active: boolean) => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    stage.style.transition = active
      ? 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none';
  }, []);

  const pointFromCenter = useCallback((clientX: number, clientY: number): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
  }, []);

  const reset = useCallback(() => {
    setStageTransition(false);
    apply(IDENTITY, { syncState: true });
  }, [apply, setStageTransition]);

  const setLayout = useCallback(
    (fitted: Size, container: Size) => {
      fittedRef.current = fitted;
      containerSizeRef.current = container;
      apply(transformRef.current, { syncState: false });
    },
    [apply],
  );

  const zoomTo = useCallback(
    (nextScale: number, origin?: Point, withTransition = true) => {
      setStageTransition(withTransition);
      const zoomed = zoomAroundPoint(
        transformRef.current,
        clamp(nextScale, IMAGE_ZOOM_MIN, IMAGE_ZOOM_MAX),
        origin ?? { x: 0, y: 0 },
      );
      apply(zoomed, { syncState: true });
    },
    [apply, setStageTransition],
  );

  const zoomIn = useCallback(() => {
    zoomTo(transformRef.current.scale + IMAGE_ZOOM_STEP);
  }, [zoomTo]);

  const zoomOut = useCallback(() => {
    zoomTo(transformRef.current.scale - IMAGE_ZOOM_STEP);
  }, [zoomTo]);

  const toggleZoom = useCallback(
    (origin: Point) => {
      const current = transformRef.current.scale;
      zoomTo(current > ZOOMED_SCALE ? IMAGE_ZOOM_MIN : IMAGE_DOUBLE_TAP_SCALE, origin);
    },
    [zoomTo],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !enabled) {
      return;
    }

    const gesture = {
      mode: 'none' as GestureMode,
      startTransform: IDENTITY,
      startDistance: 0,
      startMidpoint: { x: 0, y: 0 } as Point,
      startClient: { x: 0, y: 0 } as Point,
      lastClient: { x: 0, y: 0 } as Point,
      lastMoveAt: 0,
      moved: false,
      lastTapAt: 0,
      lastTapPoint: { x: 0, y: 0 } as Point,
      pointerId: null as number | null,
    };

    const begin = (mode: GestureMode, clientX: number, clientY: number) => {
      gesture.mode = mode;
      gesture.startTransform = { ...transformRef.current };
      gesture.startClient = { x: clientX, y: clientY };
      gesture.lastClient = { x: clientX, y: clientY };
      gesture.lastMoveAt = performance.now();
      gesture.moved = false;
      setStageTransition(false);
    };

    const startOneFinger = (clientX: number, clientY: number) => {
      const zoomed = transformRef.current.scale > ZOOMED_SCALE;
      const mode: GestureMode = zoomed
        ? 'pan'
        : onSwipeRef.current
          ? 'swipe'
          : 'none';
      begin(mode, clientX, clientY);
    };

    const handleMove = (clientX: number, clientY: number) => {
      const dx = clientX - gesture.startClient.x;
      const dy = clientY - gesture.startClient.y;
      if (Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD) {
        gesture.moved = true;
      }
      gesture.lastClient = { x: clientX, y: clientY };
      gesture.lastMoveAt = performance.now();

      if (gesture.mode === 'pan') {
        apply({
          scale: gesture.startTransform.scale,
          x: gesture.startTransform.x + dx,
          y: gesture.startTransform.y + dy,
        });
        return;
      }

      if (gesture.mode === 'swipe') {
        apply(
          {
            scale: 1,
            x: dx,
            y: 0,
          },
          { clampPan: false },
        );
      }
    };

    const finishSwipe = () => {
      const dx = gesture.lastClient.x - gesture.startClient.x;
      const elapsed = Math.max(performance.now() - gesture.lastMoveAt, 1);
      const velocity = Math.abs(dx) / elapsed;
      const shouldSwipe =
        Math.abs(dx) > SWIPE_OFFSET_PX || velocity > SWIPE_VELOCITY;

      if (shouldSwipe && onSwipeRef.current) {
        onSwipeRef.current(dx > 0 ? 'prev' : 'next');
        apply(IDENTITY, { syncState: true });
        return;
      }

      setStageTransition(true);
      apply(IDENTITY, { syncState: true });
    };

    const finishGesture = () => {
      if (gesture.mode === 'swipe') {
        finishSwipe();
      } else if (gesture.mode === 'pan' || gesture.mode === 'pinch') {
        setStageTransition(true);
        apply(transformRef.current, { syncState: true });
      }
      gesture.mode = 'none';
    };

    const handleTap = (clientX: number, clientY: number) => {
      if (gesture.moved) {
        return;
      }

      const now = performance.now();
      const point = pointFromCenter(clientX, clientY);
      const isDoubleTap =
        now - gesture.lastTapAt < DOUBLE_TAP_MS &&
        distance(point, gesture.lastTapPoint) < DOUBLE_TAP_DISTANCE;

      if (isDoubleTap) {
        toggleZoom(point);
        gesture.lastTapAt = 0;
        return;
      }

      gesture.lastTapAt = now;
      gesture.lastTapPoint = point;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const a = clientPoint(event.touches[0]);
        const b = clientPoint(event.touches[1]);
        const mid = midpoint(a, b);
        gesture.mode = 'pinch';
        gesture.startTransform = { ...transformRef.current };
        gesture.startDistance = Math.max(distance(a, b), 1);
        gesture.startMidpoint = pointFromCenter(mid.x, mid.y);
        gesture.moved = true;
        setStageTransition(false);
        return;
      }

      if (event.touches.length === 1) {
        startOneFinger(event.touches[0].clientX, event.touches[0].clientY);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && gesture.mode === 'pinch') {
        event.preventDefault();
        const a = clientPoint(event.touches[0]);
        const b = clientPoint(event.touches[1]);
        const mid = midpoint(a, b);
        const nextScale =
          gesture.startTransform.scale *
          (distance(a, b) / gesture.startDistance);
        const origin = pointFromCenter(mid.x, mid.y);
        const zoomed = zoomAroundPoint(
          gesture.startTransform,
          nextScale,
          gesture.startMidpoint,
        );
        apply({
          scale: zoomed.scale,
          x: zoomed.x + (origin.x - gesture.startMidpoint.x),
          y: zoomed.y + (origin.y - gesture.startMidpoint.y),
        });
        return;
      }

      if (event.touches.length === 1) {
        if (
          gesture.mode === 'pan' ||
          (gesture.mode === 'swipe' &&
            Math.abs(event.touches[0].clientX - gesture.startClient.x) > 6)
        ) {
          event.preventDefault();
        }
        handleMove(event.touches[0].clientX, event.touches[0].clientY);
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length >= 2) {
        return;
      }

      if (event.touches.length === 1 && gesture.mode === 'pinch') {
        const touch = event.touches[0];
        startOneFinger(touch.clientX, touch.clientY);
        apply(transformRef.current, { syncState: true });
        return;
      }

      const ended = event.changedTouches[0];
      const wasTap =
        !gesture.moved &&
        (gesture.mode === 'swipe' ||
          gesture.mode === 'pan' ||
          gesture.mode === 'none');
      finishGesture();
      if (wasTap && ended) {
        handleTap(ended.clientX, ended.clientY);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || event.button !== 0) {
        return;
      }

      gesture.pointerId = event.pointerId;
      node.setPointerCapture(event.pointerId);
      startOneFinger(event.clientX, event.clientY);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || gesture.pointerId !== event.pointerId) {
        return;
      }
      handleMove(event.clientX, event.clientY);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || gesture.pointerId !== event.pointerId) {
        return;
      }
      gesture.pointerId = null;
      if (node.hasPointerCapture(event.pointerId)) {
        node.releasePointerCapture(event.pointerId);
      }
      finishGesture();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const origin = pointFromCenter(event.clientX, event.clientY);
      const delta = event.deltaY > 0 ? -0.18 : 0.18;
      zoomTo(transformRef.current.scale + delta, origin, false);
    };

    const onDoubleClick = (event: MouseEvent) => {
      event.preventDefault();
      toggleZoom(pointFromCenter(event.clientX, event.clientY));
    };

    node.addEventListener('touchstart', onTouchStart, { passive: false });
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    node.addEventListener('touchend', onTouchEnd);
    node.addEventListener('touchcancel', onTouchEnd);
    node.addEventListener('pointerdown', onPointerDown);
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerup', onPointerUp);
    node.addEventListener('pointercancel', onPointerUp);
    node.addEventListener('wheel', onWheel, { passive: false });
    node.addEventListener('dblclick', onDoubleClick);

    return () => {
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('touchend', onTouchEnd);
      node.removeEventListener('touchcancel', onTouchEnd);
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerup', onPointerUp);
      node.removeEventListener('pointercancel', onPointerUp);
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('dblclick', onDoubleClick);
    };
  }, [apply, enabled, pointFromCenter, setStageTransition, toggleZoom, zoomTo]);

  return {
    containerRef,
    stageRef,
    scale,
    isZoomed: scale > ZOOMED_SCALE,
    canZoomIn: scale < IMAGE_ZOOM_MAX - 0.01,
    canZoomOut: scale > IMAGE_ZOOM_MIN + 0.01,
    setLayout,
    reset,
    zoomIn,
    zoomOut,
  };
}
