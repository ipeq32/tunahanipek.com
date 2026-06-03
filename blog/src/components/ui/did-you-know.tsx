'use client';

import { useTranslations } from 'next-intl';
import { Lightbulb } from 'lucide-react';
import { RotatingTerminalText } from '@/components/ui/rotating-terminal-text';

type DidYouKnowProps = {
  variant?: 'card' | 'inline';
  size?: 'sm' | 'lg';
  className?: string;
};

export function DidYouKnow({ variant = 'card', size = 'lg', className }: DidYouKnowProps) {
  const t = useTranslations('Tips');
  const tips = t.raw('items') as string[];

  return (
    <RotatingTerminalText
      lines={tips}
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
