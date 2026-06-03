'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import BlogImage from '@/components/blog/BlogImage';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { ProjectDto } from '@/lib/project-mapper';
import {
  AdminEmptyState,
  AdminListSkeleton,
  AdminStatusBadge,
} from '@/components/admin/admin-ui';
import { ContentCard } from '@/components/layout/content-card';
import { cn } from '@/lib/utils';
import {
  ExternalLink,
  EyeOff,
  FolderKanban,
  Pencil,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';

const emptyForm = {
  title: '',
  description: '',
  url: '',
  image: '',
  sortOrder: '0',
  published: false,
};

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
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (project: ProjectDto) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      url: project.url ?? '',
      image: project.image ?? '',
      sortOrder: String(project.sortOrder),
      published: project.published,
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      url: form.url.trim() || '',
      image: form.image.trim() || '',
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      published: form.published,
    };

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/projects/admin`;

      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed');

      toast.success(editingId ? t('updated') : t('created'));
      resetForm();
      fetchProjects();
    } catch {
      toast.error(t('actionError'));
    } finally {
      setSaving(false);
    }
  };

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
      if (editingId === id) resetForm();
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
    <div className="mt-6 space-y-6">
      <ContentCard>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
            {editingId ? (
              <Pencil className="h-5 w-5" />
            ) : (
              <FolderKanban className="h-5 w-5" />
            )}
          </span>
          <h2 className="text-lg font-semibold tracking-tight">
            {editingId ? t('editTitle') : t('addTitle')}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-background/40 p-4">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border/50">
              <BlogImage
                key={form.image || 'placeholder'}
                src={form.image}
                alt={form.title || 'project'}
                width={96}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium">{t('fieldImage')}</label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium">{t('fieldTitle')}</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">{t('fieldUrl')}</label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium">
                {t('fieldDescription')}
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">{t('fieldSort')}</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: e.target.value })
                }
              />
            </div>
            <label className="flex items-center gap-2 self-end rounded-lg border border-border/40 bg-background/40 px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm({ ...form, published: e.target.checked })
                }
                className="h-4 w-4 rounded border-border accent-teal-600"
              />
              {t('fieldPublished')}
            </label>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border/40 pt-4">
            <Button type="submit" variant="accent" disabled={saving}>
              {editingId ? t('save') : t('add')}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="mr-1.5 h-4 w-4" />
                {t('cancel')}
              </Button>
            )}
          </div>
        </form>
      </ContentCard>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t('statTotal')} value={stats.total} />
        <StatCard label={t('statPublished')} value={stats.published} accent />
        <StatCard label={t('statDrafts')} value={stats.drafts} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
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
              className={cn(
                'group flex flex-col gap-4 rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur-sm transition sm:flex-row sm:items-center',
                editingId === project.id
                  ? 'border-teal-500/50 ring-1 ring-teal-500/20'
                  : 'border-border/60 hover:border-teal-500/30'
              )}
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
                  <Badge variant="outline" className="text-[10px]">
                    {t('orderLabel')}: {project.sortOrder}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
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
                  onClick={() => startEdit(project)}
                  aria-label={t('edit')}
                  title={t('edit')}
                >
                  <Pencil className="h-4 w-4" />
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
