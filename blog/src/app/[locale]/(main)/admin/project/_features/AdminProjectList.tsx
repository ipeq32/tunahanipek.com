'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { ProjectDto } from '@/lib/project-mapper';
import {
  AdminEmptyState,
  AdminListCard,
  AdminListSkeleton,
  AdminStatusBadge,
} from '@/components/admin/admin-ui';
import { ContentCard } from '@/components/layout/content-card';

const emptyForm = {
  title: '',
  description: '',
  url: '',
  image: '',
  sortOrder: '0',
  published: false,
};

export default function AdminProjectList() {
  const t = useTranslations('Admin.Project');
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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

  return (
    <div className="mt-6 space-y-6">
      <ContentCard>
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? t('editTitle') : t('addTitle')}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
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
              <label className="text-xs font-medium">{t('fieldDescription')}</label>
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
              <label className="text-xs font-medium">{t('fieldImage')}</label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://"
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
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
              className="rounded border-border"
            />
            {t('fieldPublished')}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="accent" disabled={saving}>
              {editingId ? t('save') : t('add')}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                {t('cancel')}
              </Button>
            )}
          </div>
        </form>
      </ContentCard>

      {loading ? (
        <AdminListSkeleton rows={3} />
      ) : !projects.length ? (
        <AdminEmptyState message={t('empty')} />
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <AdminListCard key={project.id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{project.title}</p>
                    <AdminStatusBadge
                      published={project.published}
                      publishedLabel={t('statusPublished')}
                      draftLabel={t('statusDraft')}
                    />
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  {project.url && (
                    <p className="text-xs text-teal-600 dark:text-teal-400">
                      {project.url}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(project)}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    variant={project.published ? 'secondary' : 'accent'}
                    size="sm"
                    onClick={() => togglePublished(project)}
                  >
                    {project.published ? t('unpublish') : t('publish')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProject(project.id)}
                  >
                    {t('delete')}
                  </Button>
                </div>
              </div>
            </AdminListCard>
          ))}
        </div>
      )}
    </div>
  );
}
