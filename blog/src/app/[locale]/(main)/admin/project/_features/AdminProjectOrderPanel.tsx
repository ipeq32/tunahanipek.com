'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import BlogImage from '@/components/blog/BlogImage';
import { AdminListSkeleton, AdminStatusBadge } from '@/components/admin/admin-ui';
import { Button } from '@/components/ui/button';
import type { ProjectDto } from '@/lib/project-mapper';
import { cn } from '@/lib/utils';

type AdminProjectOrderPanelProps = {
  onClose: () => void;
  onSaved: () => void;
};

type SortableProjectRowProps = {
  project: ProjectDto;
  index: number;
  publishedLabel: string;
  draftLabel: string;
  dragLabel: string;
};

function SortableProjectRow({
  project,
  index,
  publishedLabel,
  draftLabel,
  dragLabel,
}: SortableProjectRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-sm',
        isDragging && 'z-10 border-teal-500/40 shadow-lg ring-2 ring-teal-500/20',
      )}
    >
      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground transition hover:text-foreground active:cursor-grabbing"
        aria-label={dragLabel}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="w-6 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
        {index + 1}
      </span>

      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border/50">
        <BlogImage
          src={project.image}
          alt={project.title}
          width={80}
          height={56}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{project.title}</p>
          <AdminStatusBadge
            published={project.published}
            publishedLabel={publishedLabel}
            draftLabel={draftLabel}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminProjectOrderPanel({
  onClose,
  onSaved,
}: AdminProjectOrderPanelProps) {
  const t = useTranslations('Admin.Project');
  const locale = useLocale();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const fetchSortableProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        locale,
        sortable: '1',
      });
      const res = await fetch(`/api/projects/admin?${params.toString()}`, {
        headers: { 'x-locale': locale },
      });
      if (!res.ok) throw new Error('Failed');
      const body = await res.json();
      setProjects(body.data);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    void fetchSortableProjects();
  }, [fetchSortableProjects]);

  const persistOrder = async (orderedProjects: ProjectDto[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/projects/admin/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderedIds: orderedProjects.map((project) => project.id),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(t('orderSaved'));
      onSaved();
    } catch {
      toast.error(t('orderSaveError'));
      void fetchSortableProjects();
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = projects.findIndex((project) => project.id === active.id);
    const newIndex = projects.findIndex((project) => project.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const nextProjects = arrayMove(projects, oldIndex, newIndex);
    setProjects(nextProjects);
    void persistOrder(nextProjects);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{t('orderTitle')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('orderHint')}</p>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t('orderSaving')}
            </span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t('orderDone')}
          </Button>
        </div>
      </div>

      {loading ? (
        <AdminListSkeleton rows={4} />
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((project) => project.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {projects.map((project, index) => (
                <SortableProjectRow
                  key={project.id}
                  project={project}
                  index={index}
                  publishedLabel={t('statusPublished')}
                  draftLabel={t('statusDraft')}
                  dragLabel={t('dragToReorder')}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
