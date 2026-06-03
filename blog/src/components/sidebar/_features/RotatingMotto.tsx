'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  TerminalCard,
  TerminalCursor,
} from '@/components/ui/terminal-card';

const ROTATE_INTERVAL_MS = 4500;
const TRANSITION_MS = 350;

const pickRandomIndex = (length: number, exclude: number): number => {
  if (length <= 1) return 0;

  let next = exclude;
  while (next === exclude) {
    next = Math.floor(Math.random() * length);
  }

  return next;
};

export function RotatingMotto() {
  const t = useTranslations('Footer');
  const mottos = t.raw('mottos') as string[];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // SSR'da 0. satır görünmez render edilir; mount olunca rastgele bir
    // satır seçilip görünür kılınır (hydration uyumsuzluğu olmadan).
    setMounted(true);

    if (mottos.length <= 1) return;

    setIndex(Math.floor(Math.random() * mottos.length));

    let transitionTimeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setVisible(false);
      transitionTimeout = setTimeout(() => {
        setIndex((prev) => pickRandomIndex(mottos.length, prev));
        setVisible(true);
      }, TRANSITION_MS);
    }, ROTATE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(transitionTimeout);
    };
  }, [mottos.length]);

  return (
    <TerminalCard fileName="~/dev-jokes.js">
      <div className="flex min-h-[3.5rem] items-start gap-2">
        <span
          className="select-none pt-px font-mono text-sm text-teal-400"
          aria-hidden="true"
        >
          &gt;
        </span>
        <p className="cursor-default font-mono text-[13px] leading-relaxed text-slate-200 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:text-teal-300">
          <span
            dangerouslySetInnerHTML={{ __html: mottos[index] ?? '' }}
            className={`inline transition-opacity duration-300 ease-out ${
              mounted && visible ? 'opacity-100' : 'opacity-0'
            }`}
            aria-live="polite"
          />
          {mounted && <TerminalCursor />}
        </p>
      </div>
    </TerminalCard>
  );
}
