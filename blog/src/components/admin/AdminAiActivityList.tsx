'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import AiActivityFeed from '@/components/admin/AiActivityFeed';
import { AdminListSkeleton } from '@/components/admin/admin-ui';
import { Button } from '@/components/ui/button';
import { DataPagination } from '@/components/ui/data-pagination';
import type { RecentAiUsageLog } from '@/lib/data/admin-stats';
import { Link } from '@/navigation';
import { type PageSize, type PaginationMeta } from '@/lib/pagination';

type AdminAiActivityListProps = {
  initialLogs: RecentAiUsageLog[];
  initialPagination: PaginationMeta;
};

export default function AdminAiActivityList({
  initialLogs,
  initialPagination,
}: AdminAiActivityListProps) {
  const t = useTranslations('Admin.Stats');
  const [logs, setLogs] = useState(initialLogs);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(initialPagination.page);
  const [limit, setLimit] = useState<PageSize>(initialPagination.limit);
  const [loading, setLoading] = useState(false);

  const actionLabel = useCallback(
    (key: string) => t(`ai.actions.${key}` as 'ai.actions.translate'),
    [t],
  );

  const contextLabel = useCallback(
    (key: string) => t(`ai.contexts.${key}` as 'ai.contexts.blog'),
    [t],
  );

  const providerLabel = useCallback(
    (key: string) => t(`ai.providers.${key}` as 'ai.providers.gemini'),
    [t],
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/ai-activity?${params.toString()}`);
      if (!res.ok) throw new Error('Failed');
      const body = await res.json();
      setLogs(body.data);
      setPagination(body.pagination);
    } catch {
      toast.error(t('activity.loadError'));
    } finally {
      setLoading(false);
    }
  }, [limit, page, t]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 pb-4">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="-ml-2 h-9 gap-2 text-muted-foreground hover:text-foreground"
      >
        <Link href="/admin/stats">
          <ArrowLeft className="h-4 w-4" />
          {t('activity.backToStats')}
        </Link>
      </Button>

      {loading ? (
        <AdminListSkeleton rows={5} />
      ) : (
        <AiActivityFeed
          logs={logs}
          actionLabel={actionLabel}
          contextLabel={contextLabel}
          providerLabel={providerLabel}
          labels={{
            title: t('activity.listTitle'),
            empty: t('ai.noActivity'),
            systemUser: t('ai.systemUser'),
            durationMs: (ms) => t('ai.durationMs', { ms }),
          }}
        />
      )}

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
