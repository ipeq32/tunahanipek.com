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
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.id}
          className="group rounded-xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm open:border-teal-500/30"
          open={index === 0}
        >
          <summary
            className={cn(
              'flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium',
              '[&::-webkit-details-marker]:hidden'
            )}
          >
            <span>{item.question}</span>
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border/40 px-5 pb-4 pt-2 text-sm text-muted-foreground">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
