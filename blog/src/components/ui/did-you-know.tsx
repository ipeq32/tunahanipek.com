'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Lightbulb } from 'lucide-react';
import { RotatingTerminalText } from '@/components/ui/rotating-terminal-text';

export type DidYouKnowProps = {
  variant?: 'card' | 'inline';
  size?: 'sm' | 'lg';
  className?: string;
  lines?: string[];
};

export function DidYouKnow({
  variant = 'card',
  size = 'lg',
  className,
  lines,
}: DidYouKnowProps) {
  const t = useTranslations('Tips');
  const locale = useLocale();
  const fallbackLines = useMemo(() => t.raw('items') as string[], [t]);
  const [resolvedLines, setResolvedLines] = useState(
    () => lines ?? fallbackLines
  );

  useEffect(() => {
    if (lines?.length) {
      setResolvedLines(lines);
      return;
    }

    let cancelled = false;

    async function loadLines() {
      try {
        const response = await fetch(
          `/api/site-snippets?type=TIP&locale=${encodeURIComponent(locale)}`
        );

        if (!response.ok) {
          if (!cancelled) {
            setResolvedLines(fallbackLines);
          }
          return;
        }

        const payload = (await response.json()) as { data?: string[] };
        if (!cancelled) {
          setResolvedLines(
            payload.data?.length ? payload.data : fallbackLines
          );
        }
      } catch {
        if (!cancelled) {
          setResolvedLines(fallbackLines);
        }
      }
    }

    void loadLines();

    return () => {
      cancelled = true;
    };
  }, [fallbackLines, lines, locale]);

  return (
    <RotatingTerminalText
      lines={resolvedLines}
      variant={variant}
      size={size}
      fileName="~/did-you-know.md"
      label={t('label')}
      icon={Lightbulb}
      intervalMs={9000}
      className={className}
    />
  );
}
