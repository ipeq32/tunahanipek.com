'use client';

import { Input } from '@/components/ui/input';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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
    <form onSubmit={onSubmit} className="mt-4 max-w-md">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
      />
    </form>
  );
}
