'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEFAULT_PAGE_SIZE,
  getPaginationRange,
  getVisiblePages,
  PAGE_SIZE_OPTIONS,
  type PageSize,
  type PaginationMeta,
} from '@/lib/pagination';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type DataPaginationProps = {
  pagination: PaginationMeta;
  className?: string;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: PageSize) => void;
  buildHref?: (page: number, limit: PageSize) => string;
};

export function DataPagination({
  pagination,
  className,
  onPageChange,
  onLimitChange,
  buildHref,
}: DataPaginationProps) {
  const t = useTranslations('Pagination');
  const { page, limit, total, totalPages } = pagination;

  if (total <= 0) {
    return null;
  }

  const { from, to } = getPaginationRange(page, limit, total);
  const pages = getVisiblePages(page, totalPages);
  const showControls = total > limit;

  const resolveHref = (nextPage: number, nextLimit = limit) =>
    buildHref?.(nextPage, nextLimit);

  const handlePageClick =
    (nextPage: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!onPageChange || buildHref) {
        return;
      }
      event.preventDefault();
      onPageChange(nextPage);
    };

  return (
    <div
      className={cn(
        'mt-8 flex flex-col gap-4 rounded-2xl border border-border/60',
        'bg-card/50 px-4 py-4 shadow-sm backdrop-blur-sm sm:px-5',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('range', { from, to, total })}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('pageSize')}
          </span>
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              const nextLimit = Number(value) as PageSize;
              if (onLimitChange) {
                onLimitChange(nextLimit);
                return;
              }
              const href = resolveHref(1, nextLimit);
              if (href) {
                window.location.href = href;
              }
            }}
          >
            <SelectTrigger className="h-9 w-[88px] bg-background/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showControls ? (
        <Pagination className="mx-0 w-full justify-center sm:justify-end">
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={resolveHref(page - 1) ?? '#'}
                  onClick={handlePageClick(page - 1)}
                  label={t('previous')}
                  ariaLabel={t('previousAria')}
                />
              </PaginationItem>
            )}

            {pages.map((item, index) => {
              if (item === 'ellipsisStart' || item === 'ellipsisEnd') {
                return (
                  <PaginationItem key={`${item}-${index}`}>
                    <PaginationEllipsis morePagesLabel={t('morePages')} />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={item}>
                  <PaginationLink
                    href={resolveHref(item) ?? '#'}
                    onClick={handlePageClick(item)}
                    isActive={item === page}
                    className={cn(
                      item === page &&
                        'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                    )}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href={resolveHref(page + 1) ?? '#'}
                  onClick={handlePageClick(page + 1)}
                  label={t('next')}
                  ariaLabel={t('nextAria')}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}

export function createDefaultPagination(
  total: number,
  page = 1,
  limit: PageSize = DEFAULT_PAGE_SIZE
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
