'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const ROTATE_INTERVAL_MS = 4500;
const TRANSITION_MS = 350;

export function RotatingMotto() {
  const t = useTranslations('Footer');
  const mottos = t.raw('mottos') as string[];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (mottos.length <= 1) return;

    let transitionTimeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setVisible(false);
      transitionTimeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % mottos.length);
        setVisible(true);
      }, TRANSITION_MS);
    }, ROTATE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(transitionTimeout);
    };
  }, [mottos.length]);

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-slate-950/95 shadow-lg ring-1 ring-black/5 dark:bg-slate-900/80">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/90" />
        </span>
        <span className="ml-1 select-none font-mono text-[11px] tracking-tight text-slate-400">
          ~/dev-jokes.js
        </span>
      </div>

      <div className="flex min-h-[3.5rem] items-start gap-2 px-3 py-3">
        <span
          className="select-none pt-px font-mono text-sm text-teal-400"
          aria-hidden="true"
        >
          &gt;
        </span>
        <p
          dangerouslySetInnerHTML={{ __html: mottos[index] ?? '' }}
          className={`cursor-default font-mono text-[13px] leading-relaxed text-slate-200 transition-all duration-300 ease-out [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:text-teal-300 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
          }`}
          aria-live="polite"
        />
        <span
          className="ml-px mt-0.5 inline-block h-4 w-1.5 shrink-0 animate-pulse rounded-sm bg-teal-400"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
