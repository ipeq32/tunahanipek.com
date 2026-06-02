'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function BlogSearch() {
  const t = useTranslations('Blog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

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

  return (
    <form onSubmit={onSubmit} className="relative mt-2 max-w-lg">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
        className="h-11 rounded-xl border-border/60 bg-card/80 pl-10 pr-24 shadow-sm backdrop-blur-sm"
      />
      <Button
        type="submit"
        variant="accent"
        size="icon"
        className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2"
        aria-label={t('searchPlaceholder')}
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
