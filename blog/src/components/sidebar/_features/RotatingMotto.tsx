'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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

type RotatingMottoProps = {
  mottos?: string[];
};

export function RotatingMotto({ mottos }: RotatingMottoProps) {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const fallbackMottos = useMemo(() => t.raw('mottos') as string[], [t]);
  const [resolvedMottos, setResolvedMottos] = useState(mottos ?? fallbackMottos);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mottos?.length) {
      setResolvedMottos(mottos);
      return;
    }

    let cancelled = false;

    async function loadMottos() {
      try {
        const response = await fetch(
          `/api/site-snippets?type=FOOTER_MOTTO&locale=${encodeURIComponent(locale)}`
        );

        if (!response.ok) {
          if (!cancelled) {
            setResolvedMottos(fallbackMottos);
          }
          return;
        }

        const payload = (await response.json()) as { data?: string[] };
        if (!cancelled) {
          setResolvedMottos(
            payload.data?.length ? payload.data : fallbackMottos
          );
        }
      } catch {
        if (!cancelled) {
          setResolvedMottos(fallbackMottos);
        }
      }
    }

    void loadMottos();

    return () => {
      cancelled = true;
    };
  }, [fallbackMottos, locale, mottos]);

  useEffect(() => {
    setMounted(true);

    if (resolvedMottos.length <= 1) return;

    setIndex(Math.floor(Math.random() * resolvedMottos.length));

    let transitionTimeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setVisible(false);
      transitionTimeout = setTimeout(() => {
        setIndex((prev) => pickRandomIndex(resolvedMottos.length, prev));
        setVisible(true);
      }, TRANSITION_MS);
    }, ROTATE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(transitionTimeout);
    };
  }, [resolvedMottos.length]);

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
            dangerouslySetInnerHTML={{ __html: resolvedMottos[index] ?? '' }}
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
