'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlogImage from '@/components/blog/BlogImage';
import { toast } from 'sonner';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import type { ProjectDto } from '@/lib/project-mapper';
import {
  AdminEmptyState,
  AdminListSkeleton,
  AdminStatusBadge,
} from '@/components/admin/admin-ui';
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
}: AdminProjectListProps) {
  const t = useTranslations('Admin.Project');
  const [projects, setProjects] = useState<ProjectDto[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/admin`
      );
      if (!res.ok) throw new Error('Failed');
      const { data } = await res.json();
      setProjects(data);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const togglePublished = async (project: ProjectDto) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published: !project.published }),
        }
      );
      if (!res.ok) throw new Error('Failed');
      toast.success(project.published ? t('unpublished') : t('published'));
      fetchProjects();
    } catch {
      toast.error(t('actionError'));
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed');
      toast.success(t('deleted'));
      fetchProjects();
    } catch {
      toast.error(t('actionError'));
    }
  };

  const stats = useMemo(() => {
    const published = projects.filter((p) => p.published).length;
    return {
      total: projects.length,
      published,
      drafts: projects.length - published,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'published' ? project.published : !project.published);
      const matchesQuery =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [projects, search, status]);

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
        <AdminEmptyState message={t('empty')} />
      ) : !filteredProjects.length ? (
        <AdminEmptyState message={t('noResults')} />
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
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
                <div
                  className="line-clamp-2 text-sm text-muted-foreground [&_p]:inline"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
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
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => deleteProject(project.id)}
                  aria-label={t('delete')}
                  title={t('delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
