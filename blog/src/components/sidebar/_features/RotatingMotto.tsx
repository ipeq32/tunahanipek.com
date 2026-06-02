'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const ROTATE_INTERVAL_MS = 4500;
const FADE_MS = 350;

export function RotatingMotto() {
  const t = useTranslations('Footer');
  const mottos = t.raw('mottos') as string[];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (mottos.length <= 1) return;

    let fadeTimeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % mottos.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, [mottos.length]);

  return (
    <p
      dangerouslySetInnerHTML={{ __html: mottos[index] ?? '' }}
      className={`text-center cursor-default dark:group-hover/slogan:text-slate-300 text-sm flex items-center justify-center z-10 min-h-[2.5rem] transition-opacity duration-300 ease-in-out [&_code]:rounded [&_code]:bg-slate-200/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs dark:[&_code]:bg-slate-700/80 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-live="polite"
    />
  );
}
