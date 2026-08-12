import { describe, expect, it } from 'vitest';
import {
  clampTransform,
  fitSize,
  getPanBounds,
  zoomAroundPoint,
} from './image-zoom';

describe('fitSize', () => {
  it('fits a landscape image into a portrait viewport without cropping', () => {
    const fitted = fitSize(
      { width: 1920, height: 1080 },
      { width: 390, height: 720 },
    );

    expect(fitted.width).toBeCloseTo(390);
    expect(fitted.height).toBeCloseTo(390 * (1080 / 1920));
    expect(fitted.height).toBeLessThan(720);
  });

  it('fits a portrait image into a landscape viewport without cropping', () => {
    const fitted = fitSize(
      { width: 800, height: 1600 },
      { width: 844, height: 390 },
    );

    expect(fitted.height).toBeCloseTo(390);
    expect(fitted.width).toBeCloseTo(390 * (800 / 1600));
    expect(fitted.width).toBeLessThan(844);
  });

  it('returns zero when either size is invalid', () => {
    expect(fitSize({ width: 0, height: 10 }, { width: 100, height: 100 })).toEqual(
      { width: 0, height: 0 },
    );
  });
});

describe('clampTransform', () => {
  it('keeps pan at origin when the image still fits', () => {
    const next = clampTransform(
      { scale: 1, x: 80, y: -40 },
      { width: 300, height: 180 },
      { width: 390, height: 720 },
    );

    expect(next).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it('limits pan to the overflow of a zoomed landscape image', () => {
    const fitted = { width: 390, height: 220 };
    const container = { width: 390, height: 720 };
    const bounds = getPanBounds(3, fitted, container);
    const next = clampTransform(
      { scale: 3, x: 999, y: 999 },
      fitted,
      container,
    );

    expect(next.scale).toBe(3);
    expect(next.x).toBeCloseTo(bounds.x);
    expect(next.y).toBeCloseTo(bounds.y);
  });
});

describe('zoomAroundPoint', () => {
  it('keeps the focal point under the pointer while scaling', () => {
    const current = { scale: 1, x: 0, y: 0 };
    const point = { x: 80, y: -30 };
    const next = zoomAroundPoint(current, 2, point);

    expect(next.scale).toBe(2);
    expect(point.x - (point.x - current.x) * 2).toBeCloseTo(next.x);
    expect(point.y - (point.y - current.y) * 2).toBeCloseTo(next.y);
  });
});
