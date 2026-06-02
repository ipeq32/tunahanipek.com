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
  isShowPagination,
  searchQuery,
  activeTag,
  activeCategory,
}: PaginationComponentProps) => {
  const totalPages = Math.ceil(total / limit);

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (searchQuery?.trim()) params.set('q', searchQuery.trim());
    if (activeTag?.trim()) params.set('tag', activeTag.trim());
    if (activeCategory?.trim()) params.set('category', activeCategory.trim());
    return `?${params.toString()}`;
  };

  const safeCurrentPage = isNaN(currentPage) ? 1 : currentPage;
  const safeTotalPages = isNaN(totalPages) ? 1 : totalPages;

  const getPages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (safeTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const startPage = Math.max(safeCurrentPage - 1, 2);
      const endPage = Math.min(safeCurrentPage + 1, safeTotalPages - 1);

      if (startPage > 2) {
        pages.push('ellipsisStart');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < safeTotalPages - 1) {
        pages.push('ellipsisEnd');
      }

      pages.push(safeTotalPages);
    }

    return pages;
  };

  return isShowPagination ? (
    <Pagination className="mt-10">
      <PaginationContent>
        {safeCurrentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={pageHref(safeCurrentPage - 1)} />
          </PaginationItem>
        )}

        {getPages().map((page, index) => {
          if (page === 'ellipsisStart' || page === 'ellipsisEnd') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={`page-${page}`}>
              <PaginationLink
                href={pageHref(page as number)}
                isActive={page === safeCurrentPage}
              >
                {String(page)}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {safeCurrentPage < safeTotalPages && (
          <PaginationItem>
            <PaginationNext href={pageHref(safeCurrentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  ) : null;
};

export default PaginationComponent;
