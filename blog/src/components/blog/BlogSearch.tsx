'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

type BlogSearchProps = {
  initialQuery?: string;
};

export default function BlogSearch({ initialQuery = '' }: BlogSearchProps) {
  const t = useTranslations('Blog');
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/blog',
      query: {
        page: '1',
        ...(query.trim() ? { q: query.trim() } : {}),
      },
    });
  };

  const onClear = () => {
    setQuery('');
    router.push({ pathname: '/blog', query: { page: '1' } });
  };

  const hasQuery = query.trim().length > 0;

  return (
    <section className="mt-2 w-full">
      <form
        onSubmit={onSubmit}
        className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-md transition-[box-shadow,border-color] focus-within:border-teal-500/35 focus-within:shadow-md focus-within:ring-1 focus-within:ring-teal-500/20 sm:flex-row sm:items-stretch"
      >
        <div className="relative min-w-0 flex-1 bg-background/40">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400"
            aria-hidden
          />
          <Input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            role="searchbox"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="h-12 w-full rounded-none border-0 bg-transparent pl-12 pr-11 text-base shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-0 sm:h-14 sm:pr-12"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
              aria-label={t('searchClear')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          variant="accent"
          className="h-12 shrink-0 rounded-none px-8 text-sm font-semibold sm:h-auto sm:min-h-14 sm:border-l sm:border-teal-600/20 sm:px-10"
        >
          <Search className="mr-2 h-4 w-4 sm:hidden" />
          {t('searchSubmit')}
        </Button>
      </form>
    </section>
  );
}
