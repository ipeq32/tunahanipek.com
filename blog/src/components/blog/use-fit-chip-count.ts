import { useLayoutEffect, useState, type RefObject } from 'react';

const CHIP_GAP_PX = 6;

type MeasureItem = { id: string; label: string };

function countFitting(widths: number[], availablePx: number): number {
  if (widths.length === 0 || availablePx <= 0) return 0;

  let used = 0;
  let count = 0;

  for (const width of widths) {
    const next = count === 0 ? width : used + CHIP_GAP_PX + width;
    if (next <= availablePx) {
      used = next;
      count++;
      continue;
    }
    break;
  }

  if (count === 0 && widths.length > 0) return 1;
  return count;
}

export function useFitChipCount(
  items: MeasureItem[],
  expanded: boolean,
  measureRef: RefObject<HTMLDivElement | null>,
  chipsRef: RefObject<HTMLDivElement | null>
) {
  const [fitCount, setFitCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    if (expanded) {
      setFitCount(items.length);
      setIsReady(true);
      return;
    }

    setIsReady(false);

    const measure = measureRef.current;
    const chips = chipsRef.current;
    if (!measure || !chips || items.length === 0) {
      setFitCount(0);
      setIsReady(true);
      return;
    }

    const run = () => {
      const chipEls = measure.querySelectorAll('[data-measure-chip]');
      const widths = Array.from(chipEls).map(
        (el) => (el as HTMLElement).offsetWidth
      );
      if (widths.length === 0) return;

      const available = chips.clientWidth;
      if (available <= 0) return;

      setFitCount(countFitting(widths, available));
      setIsReady(true);
    };

    run();

    const observer = new ResizeObserver(run);
    observer.observe(chips);

    return () => observer.disconnect();
  }, [items, expanded, measureRef, chipsRef]);

  return { fitCount, isReady };
}
