export const IMAGE_ZOOM_MIN = 1;
export const IMAGE_ZOOM_MAX = 4;
export const IMAGE_ZOOM_STEP = 0.6;
export const IMAGE_DOUBLE_TAP_SCALE = 2.4;

export type Size = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Transform = {
  scale: number;
  x: number;
  y: number;
};

export function clamp(value: number, min: number, max: number) {
  const next = Math.min(max, Math.max(min, value));
  return Object.is(next, -0) ? 0 : next;
}

export function fitSize(natural: Size, container: Size): Size {
  if (
    natural.width <= 0 ||
    natural.height <= 0 ||
    container.width <= 0 ||
    container.height <= 0
  ) {
    return { width: 0, height: 0 };
  }

  const ratio = Math.min(
    container.width / natural.width,
    container.height / natural.height,
  );

  return {
    width: natural.width * ratio,
    height: natural.height * ratio,
  };
}

export function getPanBounds(
  scale: number,
  fitted: Size,
  container: Size,
): Point {
  return {
    x: Math.max(0, (fitted.width * scale - container.width) / 2),
    y: Math.max(0, (fitted.height * scale - container.height) / 2),
  };
}

export function clampTransform(
  transform: Transform,
  fitted: Size,
  container: Size,
  minScale = IMAGE_ZOOM_MIN,
  maxScale = IMAGE_ZOOM_MAX,
): Transform {
  const scale = clamp(transform.scale, minScale, maxScale);
  const bounds = getPanBounds(scale, fitted, container);

  return {
    scale,
    x: clamp(transform.x, -bounds.x, bounds.x),
    y: clamp(transform.y, -bounds.y, bounds.y),
  };
}

export function zoomAroundPoint(
  current: Transform,
  nextScale: number,
  pointFromCenter: Point,
): Transform {
  const safeCurrent = current.scale === 0 ? 1 : current.scale;
  const ratio = nextScale / safeCurrent;

  return {
    scale: nextScale,
    x: pointFromCenter.x - (pointFromCenter.x - current.x) * ratio,
    y: pointFromCenter.y - (pointFromCenter.y - current.y) * ratio,
  };
}

export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function toTransformStyle(transform: Transform) {
  return `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`;
}
