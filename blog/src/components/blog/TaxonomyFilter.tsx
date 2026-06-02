'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, FolderOpen, Hash, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFitChipCount } from './use-fit-chip-count';

type Item = { id: string; name: string };

type Props = {
  tags: Item[];
  categories: Item[];
  activeTag?: string;
  activeCategory?: string;
};

type Tab = 'tags' | 'categories';

const chipClassName = (active: boolean) =>
  cn(
    'inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-xs font-medium transition-all',
    active
      ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-600/20 dark:bg-teal-500 dark:ring-teal-400/30'
      : 'bg-muted/50 text-foreground/80 ring-1 ring-border/40 hover:bg-muted hover:ring-teal-500/25'
  );

const expandBtnClass =
  'inline-flex shrink-0 items-center gap-1 rounded-md bg-background px-2 py-1 text-xs font-medium text-foreground shadow-sm ring-1 ring-border/50 transition-all hover:ring-teal-500/30 hover:text-teal-700 dark:hover:text-teal-300';

function ChipLink({
  href,
  active,
  children,
}: {
  href: Parameters<typeof Link>[0]['href'];
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={chipClassName(active)}>
      {children}
    </Link>
  );
}

function pickVisibleItems(
  items: Item[],
  activeName: string | undefined,
  limit: number
) {
  if (items.length <= limit) return items;

  const slice = items.slice(0, limit);
  if (!activeName) return slice;

  if (slice.some((item) => item.name === activeName)) return slice;

  const activeItem = items.find((item) => item.name === activeName);
  if (!activeItem) return slice;

  return [...slice.slice(0, limit - 1), activeItem];
}

function itemLabel(tab: Tab, name: string) {
  return tab === 'tags' ? `#${name}` : name;
}

export default function TaxonomyFilter({
  tags,
  categories,
  activeTag,
  activeCategory,
}: Props) {
  const t = useTranslations('Blog.Taxonomy');
  const hasTags = tags.length > 0;
  const hasCategories = categories.length > 0;

  const showTabs = hasTags && hasCategories;
  const defaultTab: Tab = hasTags ? 'tags' : 'categories';
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [expanded, setExpanded] = useState(false);

  const measureRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCategory && hasCategories) setTab('categories');
    else if (activeTag && hasTags) setTab('tags');
  }, [activeCategory, activeTag, hasCategories, hasTags]);

  const items = tab === 'tags' ? tags : categories;
  const activeName = tab === 'tags' ? activeTag : activeCategory;

  const measureItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        label: itemLabel(tab, item.name),
      })),
    [items, tab]
  );

  const { fitCount, isReady } = useFitChipCount(
    measureItems,
    expanded,
    measureRef,
    chipsRef
  );

  const visibleItems = useMemo(() => {
    if (expanded) return items;
    if (!isReady) return [];
    return pickVisibleItems(items, activeName, fitCount);
  }, [expanded, isReady, items, activeName, fitCount]);

  const remainingCount = Math.max(0, items.length - visibleItems.length);
  const hasOverflow = isReady && !expanded && remainingCount > 0;
  const showExpandControl =
    isReady && (hasOverflow || expanded) && items.length > 0;

  if (!hasTags && !hasCategories) return null;

  const hasActiveFilter = Boolean(activeTag || activeCategory);

  const segmentClass = (value: Tab) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
      tab === value
        ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
        : 'text-muted-foreground hover:text-foreground'
    );

  const switchTab = (value: Tab) => {
    setTab(value);
    setExpanded(false);
  };

  const tabSwitcher = showTabs ? (
    <div
      className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5"
      role="tablist"
      aria-label={t('filtersLabel')}
    >
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'tags'}
        className={segmentClass('tags')}
        onClick={() => switchTab('tags')}
      >
        <Hash className="h-3.5 w-3.5" aria-hidden />
        {t('tags')}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'categories'}
        className={segmentClass('categories')}
        onClick={() => switchTab('categories')}
      >
        <FolderOpen className="h-3.5 w-3.5" aria-hidden />
        {t('categories')}
      </button>
    </div>
  ) : (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {hasTags ? (
        <>
          <Hash className="h-3.5 w-3.5" aria-hidden />
          {t('tags')}
        </>
      ) : (
        <>
          <FolderOpen className="h-3.5 w-3.5" aria-hidden />
          {t('categories')}
        </>
      )}
    </span>
  );

  const expandButton = showExpandControl ? (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      aria-expanded={expanded}
      aria-label={
        expanded
          ? t('collapseFilters')
          : t('expandFilters', { count: remainingCount })
      }
      className={expandBtnClass}
    >
      {expanded ? (
        <>
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
          <span>{t('showLess')}</span>
        </>
      ) : (
        <>
          <span>{t('showAll')}</span>
          {remainingCount > 0 && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
              {remainingCount}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        </>
      )}
    </button>
  ) : null;

  const chipList = (
    <div
      className={cn(
        'flex w-full gap-1.5',
        expanded ? 'flex-wrap' : 'flex-nowrap overflow-hidden'
      )}
    >
      {tab === 'tags'
        ? visibleItems.map((tag) => (
            <ChipLink
              key={tag.id}
              href={{
                pathname: '/blog/tag/[name]',
                params: { name: tag.name },
              }}
              active={activeTag === tag.name}
            >
              #{tag.name}
            </ChipLink>
          ))
        : visibleItems.map((cat) => (
            <ChipLink
              key={cat.id}
              href={{
                pathname: '/blog/category/[name]',
                params: { name: cat.name },
              }}
              active={activeCategory === cat.name}
            >
              {cat.name}
            </ChipLink>
          ))}
    </div>
  );

  return (
    <section className="relative mt-3 w-full" aria-label={t('filtersLabel')}>
      <div
        ref={measureRef}
        className="pointer-events-none absolute -left-[9999px] top-0 flex gap-1.5 opacity-0"
        aria-hidden
      >
        {measureItems.map((item) => (
          <span
            key={item.id}
            data-measure-chip
            className={chipClassName(false)}
          >
            {item.label}
          </span>
        ))}
      </div>

      {hasActiveFilter && (
        <div className="mb-2 flex flex-wrap items-center gap-2 px-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('active')}
          </span>
          {activeTag && (
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-teal-500/20 dark:text-teal-300">
              <Hash className="h-3 w-3" aria-hidden />
              {activeTag}
            </span>
          )}
          {activeCategory && (
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-teal-500/20 dark:text-teal-300">
              <FolderOpen className="h-3 w-3" aria-hidden />
              {activeCategory}
            </span>
          )}
          <Link
            href={{ pathname: '/blog', query: { page: '1' } }}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <X className="h-3 w-3" aria-hidden />
            {t('clearFilters')}
          </Link>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/20 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-stretch">
          {/* Mobil: üst — sekme + buton · Masaüstü: sol — yalnızca sekme */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 px-2.5 py-2 md:justify-start md:self-start md:border-b-0 md:px-1.5 md:py-1.5">
            {tabSwitcher}
            <div className="md:hidden">{expandButton}</div>
          </div>

          <div
            className="hidden w-px shrink-0 self-stretch bg-border/70 md:block"
            aria-hidden
          />

          {/* Mobil: alt — chip listesi · Masaüstü: sağ — liste + buton */}
          <div
            className="flex min-w-0 flex-1 items-start gap-1.5 px-2.5 py-2 md:px-0 md:py-1.5 md:pl-2 md:pr-1.5"
            role="tabpanel"
          >
            <div
              ref={chipsRef}
              className={cn(
                'min-h-8 min-w-0 w-full flex-1 overflow-hidden md:w-auto',
                !isReady && !expanded && 'opacity-0',
                isReady && 'opacity-100 transition-opacity duration-150'
              )}
            >
              {chipList}
            </div>
            <div className="hidden shrink-0 md:block">{expandButton}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
