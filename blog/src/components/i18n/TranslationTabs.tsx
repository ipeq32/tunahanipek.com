'use client';

import type { LanguageDto } from '@/lib/languages';
import { getLanguageTabLabel } from '@/lib/language-tab-label';
import { cn } from '@/lib/utils';

type TranslationTabsProps = {
  languages: LanguageDto[];
  activeCode: string;
  onChange: (code: string) => void;
  className?: string;
};

export default function TranslationTabs({
  languages,
  activeCode,
  onChange,
  className,
}: TranslationTabsProps) {
  if (languages.length <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-lg border border-border/60 bg-card/60 p-1',
        className,
      )}
      role="tablist"
      aria-label="Languages"
    >
      {languages.map((language) => {
        const isActive = language.code === activeCode;

        return (
          <button
            key={language.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(language.code)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors',
              isActive
                ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {getLanguageTabLabel(language.code, language.name)}
          </button>
        );
      })}
    </div>
  );
}
