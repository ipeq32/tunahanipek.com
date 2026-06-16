'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { DataPagination } from '@/components/ui/data-pagination';
import {
  AdminEmptyState,
  AdminListCard,
  AdminListSkeleton,
} from '@/components/admin/admin-ui';
import type { PendingCommentDto } from '@/lib/comments/types';
import { type PageSize, type PaginationMeta } from '@/lib/pagination';

type AdminCommentsListProps = {
  initialComments: PendingCommentDto[];
  initialPagination: PaginationMeta;
};

export default function AdminCommentsList({
  initialComments,
  initialPagination,
}: AdminCommentsListProps) {
  const t = useTranslations('Admin.Comments');
  const [comments, setComments] = useState<PendingCommentDto[]>(initialComments);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(initialPagination.page);
  const [limit, setLimit] = useState<PageSize>(initialPagination.limit);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/comments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed');
      const body = await res.json();
      setComments(body.data);
      setPagination(body.pagination);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [limit, page, t]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  const moderate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(status === 'APPROVED' ? t('approved') : t('rejected'));
      fetchComments();
    } catch {
      toast.error(t('actionError'));
    }
  };

  if (loading) return <AdminListSkeleton rows={3} />;
  if (!comments.length) {
    return (
      <>
        <AdminEmptyState message={t('empty')} />
        <DataPagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
        />
      </>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {comments.map((c) => (
        <AdminListCard key={c.id}>
          <p className="text-sm leading-relaxed">{c.content}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {c.user?.name} ({c.user?.email})
            {c.blog && (
              <>
                {' · '}
                <Link
                  href={{ pathname: '/blog/[id]', params: { id: c.blog.id } }}
                  className="text-teal-600 hover:underline dark:text-teal-400"
                >
                  {c.blog.title}
                </Link>
              </>
            )}
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="accent"
              onClick={() => moderate(c.id, 'APPROVED')}
            >
              {t('approve')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => moderate(c.id, 'REJECTED')}
            >
              {t('reject')}
            </Button>
          </div>
        </AdminListCard>
      ))}

      <DataPagination
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
}
