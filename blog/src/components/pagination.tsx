'use client';

import { DataPagination } from '@/components/ui/data-pagination';
import { parseLimit, parsePage, type PageSize } from '@/lib/pagination';
import { useTranslations } from 'next-intl';

type PaginationComponentProps = {
  total: number;
  currentPage: number;
  limit: number;
  isShowPagination?: boolean;
  searchQuery?: string;
  activeTag?: string;
  activeCategory?: string;
};

const PaginationComponent = ({
  total,
  currentPage,
  limit,
  isShowPagination = true,
  searchQuery,
  activeTag,
  activeCategory,
}: PaginationComponentProps) => {
  const safePage = parsePage(currentPage);
  const safeLimit = parseLimit(limit);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  const buildHref = (page: number, nextLimit: PageSize) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(nextLimit));
    if (searchQuery?.trim()) params.set('q', searchQuery.trim());
    if (activeTag?.trim()) params.set('tag', activeTag.trim());
    if (activeCategory?.trim()) params.set('category', activeCategory.trim());
    return `?${params.toString()}`;
  };

  if (!isShowPagination || total <= 0) {
    return null;
  }

  return (
    <DataPagination
      pagination={{
        page: Math.min(safePage, totalPages),
        limit: safeLimit,
        total,
        totalPages,
      }}
      buildHref={buildHref}
    />
  );
};

export default PaginationComponent;
