export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_PAGE_SIZE: PageSize = 20;

export type PaginationMeta = {
  page: number;
  limit: PageSize;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export function isValidPageSize(value: number): value is PageSize {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(value);
}

export function parsePage(value: string | number | undefined | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

export function parseLimit(value: string | number | undefined | null): PageSize {
  const parsed = Number(value);
  if (isValidPageSize(parsed)) {
    return parsed;
  }
  return DEFAULT_PAGE_SIZE;
}

export function parsePaginationParams(params: {
  page?: string | number | null;
  limit?: string | number | null;
}): { page: number; limit: PageSize; skip: number } {
  const page = parsePage(params.page);
  const limit = parseLimit(params.limit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta(
  page: number,
  limit: PageSize,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  page: number,
  limit: PageSize,
  total: number
): PaginatedResult<T> {
  return {
    data,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

export function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): Array<number | 'ellipsisStart' | 'ellipsisEnd'> {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | 'ellipsisStart' | 'ellipsisEnd'> = [1];
  const startPage = Math.max(currentPage - 1, 2);
  const endPage = Math.min(currentPage + 1, totalPages - 1);

  if (startPage > 2) {
    pages.push('ellipsisStart');
  }

  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  if (endPage < totalPages - 1) {
    pages.push('ellipsisEnd');
  }

  pages.push(totalPages);
  return pages;
}

export function getPaginationRange(
  page: number,
  limit: number,
  total: number
): { from: number; to: number } {
  if (total === 0) {
    return { from: 0, to: 0 };
  }

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return { from, to };
}

export function parsePaginationFromRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  return parsePaginationParams({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
}
