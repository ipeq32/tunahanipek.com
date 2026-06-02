'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Item = { id: string; name: string };

type Props = {
  tags: Item[];
  categories: Item[];
  activeTag?: string;
  activeCategory?: string;
};

export default function TaxonomyFilter({
  tags,
  categories,
  activeTag,
  activeCategory,
}: Props) {
  const t = useTranslations('Blog.Taxonomy');

  if (!tags.length && !categories.length) return null;

  const chipClass = (active: boolean) =>
    cn(
      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
      active
        ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500'
        : 'border-border/60 bg-card/60 text-muted-foreground hover:border-teal-500/50 hover:text-foreground'
    );

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-border/40 bg-muted/20 p-4 sm:p-5">
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('tags')}
          </span>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={{ pathname: '/blog/tag/[name]', params: { name: tag.name } }}
              className={chipClass(activeTag === tag.name)}
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('categories')}
          </span>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={{
                pathname: '/blog/category/[name]',
                params: { name: cat.name },
              }}
              className={chipClass(activeCategory === cat.name)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
