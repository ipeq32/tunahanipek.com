'use client';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  openFirst?: boolean;
};

export function FaqAccordion({ items, openFirst = false }: FaqAccordionProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.id}
          className="group rounded-xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-colors open:border-teal-500/30 open:bg-teal-500/[0.03]"
          open={openFirst && index === 0}
        >
          <summary
            className={cn(
              'flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium transition-colors hover:text-teal-700 dark:hover:text-teal-300',
              '[&::-webkit-details-marker]:hidden'
            )}
          >
            <span>{item.question}</span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 transition-transform group-open:rotate-180 dark:text-teal-400">
              <ChevronDown className="h-4 w-4" />
            </span>
          </summary>
          <div className="px-5 pb-4 pt-0 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
