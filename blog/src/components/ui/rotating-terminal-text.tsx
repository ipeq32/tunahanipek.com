'use client';

import { ComponentType, useEffect, useState } from 'react';
import { LucideProps } from 'lucide-react';
import { TerminalCard, TerminalCursor } from '@/components/ui/terminal-card';
import { cn } from '@/lib/utils';

const TRANSITION_MS = 350;

const pickRandomIndex = (length: number, exclude: number): number => {
  if (length <= 1) return 0;

  let next = exclude;
  while (next === exclude) {
    next = Math.floor(Math.random() * length);
  }

  return next;
};

type CardSize = 'sm' | 'lg';

const SIZE_STYLES: Record<
  CardSize,
  { body: string; code: string; prompt: string; minH: string; padding: string }
> = {
  sm: {
    body: 'text-[13px]',
    code: '[&_code]:text-[12px]',
    prompt: 'text-sm',
    minH: 'min-h-[3rem]',
    padding: '',
  },
  lg: {
    body: 'text-base md:text-lg',
    code: '[&_code]:text-[15px]',
    prompt: 'text-base md:text-lg',
    minH: 'min-h-[4.5rem]',
    padding: 'px-5 py-5',
  },
};

type RotatingTerminalTextProps = {
  lines: string[];
  variant?: 'card' | 'inline';
  size?: CardSize;
  fileName?: string;
  label?: string;
  prompt?: string;
  icon?: ComponentType<LucideProps>;
  intervalMs?: number;
  className?: string;
};

export function RotatingTerminalText({
  lines,
  variant = 'card',
  size = 'sm',
  fileName,
  label,
  prompt = '#',
  icon: Icon,
  intervalMs = 6000,
  className,
}: RotatingTerminalTextProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (lines.length <= 1) return;

    let transitionTimeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setVisible(false);
      transitionTimeout = setTimeout(() => {
        setIndex((prev) => pickRandomIndex(lines.length, prev));
        setVisible(true);
      }, TRANSITION_MS);
    }, intervalMs);

    return () => {
      clearInterval(interval);
      clearTimeout(transitionTimeout);
    };
  }, [lines.length, intervalMs]);

  const text = (
    <span
      dangerouslySetInnerHTML={{ __html: lines[index] ?? '' }}
      className={cn(
        'inline transition-opacity duration-300 ease-out',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      aria-live="polite"
    />
  );

  if (variant === 'inline') {
    return (
      <p
        className={cn(
          'flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_code]:text-teal-600 dark:[&_code]:text-teal-400',
          className,
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-teal-500" aria-hidden="true" />}
        {text}
      </p>
    );
  }

  const s = SIZE_STYLES[size];

  return (
    <TerminalCard fileName={fileName} className={className} bodyClassName={s.padding}>
      {(label || Icon) && (
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-teal-400">
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
          {label}
        </div>
      )}
      <div className={cn('flex items-start gap-2', s.minH)}>
        <span
          className={cn('select-none pt-px font-mono text-teal-400', s.prompt)}
          aria-hidden="true"
        >
          {prompt}
        </span>
        <p
          className={cn(
            'font-mono leading-relaxed text-slate-100 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-teal-300',
            s.body,
            s.code,
          )}
        >
          {text}
          <TerminalCursor />
        </p>
      </div>
    </TerminalCard>
  );
}
