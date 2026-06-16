'use client';

import { cn } from '@/lib/utils';

export type CharacterCountState = 'below-min' | 'over-max' | 'normal';

type CharacterCountProps = {
  value: string;
  min?: number;
  max?: number;
  trim?: boolean;
  className?: string;
};

export function getCharacterLength(
  value: string,
  { trim = true }: { trim?: boolean } = {}
): number {
  return trim ? value.trim().length : value.length;
}

export function getCharacterCountState(
  length: number,
  { min, max }: { min?: number; max?: number }
): CharacterCountState {
  if (max !== undefined && length > max) {
    return 'over-max';
  }

  if (min !== undefined && length < min) {
    return 'below-min';
  }

  return 'normal';
}

export function CharacterCount({
  value,
  min,
  max,
  trim = true,
  className,
}: CharacterCountProps) {
  const length = getCharacterLength(value, { trim });
  const state = getCharacterCountState(length, { min, max });
  const denominator = max ?? min;

  if (denominator === undefined) {
    return null;
  }

  return (
    <p
      className={cn(
        'shrink-0 text-xs tabular-nums',
        state === 'below-min' && 'font-medium text-destructive',
        state === 'over-max' && 'font-medium text-amber-600 dark:text-amber-400',
        state === 'normal' && 'text-muted-foreground',
        className
      )}
      aria-live="polite"
    >
      {length}/{denominator}
    </p>
  );
}
