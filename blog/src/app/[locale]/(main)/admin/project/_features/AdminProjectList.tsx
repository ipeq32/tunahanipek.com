'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlogImage from '@/components/blog/BlogImage';
import { DataPagination } from '@/components/ui/data-pagination';
import { toast } from 'sonner';
import { Link } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { ProjectDto } from '@/lib/project-mapper';
import type { AdminProjectStats } from '@/lib/data/projects';
import { stripHtmlText } from '@/lib/translation-form-utils';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { type PageSize, type PaginationMeta } from '@/lib/pagination';
import {
  AdminEmptyState,
  AdminListSkeleton,
  AdminStatusBadge,
} from '@/components/admin/admin-ui';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import {
  ExternalLink,
  EyeOff,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from 'lucide-react';

type AdminProjectListProps = {
  initialProjects: ProjectDto[];
  initialPagination: PaginationMeta;
  initialStats: AdminProjectStats;
  canPublish?: boolean;
  canDelete?: boolean;
};

type StatusFilter = 'all' | 'published' | 'drafts';

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-2xl font-bold tabular-nums',
          accent && 'text-teal-600 dark:text-teal-400'
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminProjectList({
  initialProjects,
  initialPagination,
  initialStats,
  canPublish = false,
  canDelete = false,
}: AdminProjectListProps) {
  const t = useTranslations('Admin.Project');
  const locale = useLocale();
  const [projects, setProjects] = useState<ProjectDto[]>(initialProjects);
  const [pagination, setPagination] = useState(initialPagination);
  const [stats, setStats] = useState(initialStats);
  const [page, setPage] = useState(initialPagination.page);
  const [limit, setLimit] = useState<PageSize>(initialPagination.limit);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<ProjectDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        locale,
        page: String(page),
        limit: String(limit),
      });
      if (debouncedSearch.trim()) {
        params.set('search', debouncedSearch.trim());
      }
      if (status !== 'all') {
        params.set('status', status);
      }

      const res = await fetch(`/api/projects/admin?${params.toString()}`, {
        headers: { 'x-locale': locale },
      });
      if (!res.ok) throw new Error('Failed');
      const body = await res.json();
      setProjects(body.data);
      setPagination(body.pagination);
      if (body.stats) {
        setStats(body.stats);
      }
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, limit, locale, page, status, t]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const togglePublished = async (project: ProjectDto) => {
    try {
      const res = await fetch(
        `/api/projects/${project.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-locale': locale,
          },
          body: JSON.stringify({
            published: !project.published,
          }),
        }
      );
      if (!res.ok) throw new Error('Failed');
      toast.success(project.published ? t('unpublished') : t('published'));
      fetchProjects();
    } catch {
      toast.error(t('actionError'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(t('deleted'));
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      toast.error(t('actionError'));
    } finally {
      setDeleting(false);
    }
  };

  const filters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('filterAll') },
    { value: 'published', label: t('filterPublished') },
    { value: 'drafts', label: t('filterDrafts') },
  ];

  return (
    <div className="mt-6 space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t('statTotal')} value={stats.total} />
        <StatCard label={t('statPublished')} value={stats.published} accent />
        <StatCard label={t('statDrafts')} value={stats.drafts} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border/60 bg-card/60 p-0.5">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  status === filter.value
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={fetchProjects}
            aria-label={t('refresh')}
            title={t('refresh')}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="accent" size="sm" asChild>
            <Link href="/admin/project/add" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {t('addTitle')}
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <AdminListSkeleton rows={3} />
      ) : !projects.length ? (
        <AdminEmptyState message={search.trim() ? t('noResults') : t('empty')} />
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col gap-4 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm transition hover:border-teal-500/30 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border/50 sm:h-20 sm:w-32 sm:shrink-0">
                <BlogImage
                  src={project.image}
                  alt={project.title}
                  width={160}
                  height={100}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold leading-tight">{project.title}</p>
                  <AdminStatusBadge
                    published={project.published}
                    publishedLabel={t('statusPublished')}
                    draftLabel={t('statusDraft')}
                  />
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {stripHtmlText(project.description)}
                </p>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline dark:text-teal-400"
                  >
                    {t('visit')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  asChild
                  aria-label={t('edit')}
                  title={t('edit')}
                >
                  <Link
                    href={{
                      pathname: '/admin/project/[id]/edit',
                      params: { id: project.id },
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                {canPublish && (
                  <Button
                    variant={project.published ? 'secondary' : 'accent'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => togglePublished(project)}
                  >
                    {project.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {project.published ? t('unpublish') : t('publish')}
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setDeleteTarget(project)}
                    aria-label={t('delete')}
                    title={t('delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DataPagination
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('deleteTitle')}
        description={t('deleteConfirm', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
