'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { FileDown, FileText, Loader2, Trash2 } from 'lucide-react';
import PdfUpload from '@/components/upload/PdfUpload';
import { useUploadCleanup } from '@/components/upload/use-upload-cleanup';
import { ContentCard } from '@/components/layout/content-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { buildAdminResumePreviewSrc } from '@/lib/resume-preview-url';

type ResumeData = {
  url: string;
  fileName: string;
  updatedAt: string;
};

type ResumeSettingsSectionProps = {
  initialResume: ResumeData | null;
};

function ensurePdfFileName(name: string): string {
  const trimmed = name.trim() || 'resume.pdf';
  return trimmed.toLowerCase().endsWith('.pdf') ? trimmed : `${trimmed}.pdf`;
}

function mapResumeData(data: ResumeData | null) {
  return {
    saved: data,
    draftUrl: data?.url ?? '',
    draftFileName: data?.fileName ?? '',
  };
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
        <FileText className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-lg font-semibold leading-tight tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function ResumeSettingsSection({
  initialResume,
}: ResumeSettingsSectionProps) {
  const t = useTranslations('Settings');
  const cleanup = useUploadCleanup();

  const initial = mapResumeData(initialResume);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState<ResumeData | null>(initial.saved);
  const [draftUrl, setDraftUrl] = useState(initial.draftUrl);
  const [draftFileName, setDraftFileName] = useState(initial.draftFileName);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      setRefreshing(true);
      try {
        const res = await fetch('/api/admin/resume');
        if (!res.ok) {
          if (res.status === 403) {
            if (!options?.silent) {
              toast.error(t('resumeForbiddenError'));
            }
            return;
          }
          throw new Error('load failed');
        }

        const json = (await res.json()) as { data: ResumeData | null };
        const next = mapResumeData(json.data);
        setSaved(next.saved);
        setDraftUrl(next.draftUrl);
        setDraftFileName(next.draftFileName);
      } catch {
        if (!options?.silent) {
          toast.error(t('resumeLoadError'));
        }
      } finally {
        setRefreshing(false);
      }
    },
    [t]
  );

  useEffect(() => {
    void load({ silent: true });
  }, [load]);

  const hasUnsavedUpload =
    Boolean(draftUrl) &&
    (!saved || draftUrl !== saved.url || draftFileName !== saved.fileName);

  const handleSave = async () => {
    if (!draftUrl) {
      toast.error(t('resumeNoFile'));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: draftUrl,
          fileName: ensurePdfFileName(draftFileName),
        }),
      });

      if (!res.ok) throw new Error('save failed');

      const json = (await res.json()) as { data: ResumeData };
      setSaved(json.data);
      setDraftUrl(json.data.url);
      setDraftFileName(json.data.fileName);
      cleanup.commit();
      toast.success(t('resumeSaved'));
    } catch {
      toast.error(t('resumeSaveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('resumeDeleteConfirm'))) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/resume', { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');

      cleanup.commit();
      setSaved(null);
      setDraftUrl('');
      setDraftFileName('');
      toast.success(t('resumeDeleted'));
    } catch {
      toast.error(t('resumeDeleteError'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ContentCard>
      <SectionHeader
        title={t('resumeTitle')}
        description={t('resumeDescription')}
      />

      {refreshing && (
        <p className="-mt-2 mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t('resumeLoading')}
        </p>
      )}

      {saved && (
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">
          {t('resumeLastUpdated', {
            date: new Date(saved.updatedAt).toLocaleString(),
          })}
        </p>
      )}

      {saved && hasUnsavedUpload && (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          {t('resumeReplaceWarning')}
        </p>
      )}

      <PdfUpload
        value={draftUrl || undefined}
        fileName={draftFileName || undefined}
        onChange={(url, fileName) => {
          setDraftUrl(url);
          setDraftFileName(fileName);
        }}
        disabled={saving || deleting}
        cleanup={cleanup}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
        <Button
          type="button"
          variant="accent"
          disabled={!hasUnsavedUpload || saving || deleting}
          onClick={() => void handleSave()}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? t('saving') : t('saveResume')}
        </Button>

        {saved && draftUrl && (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                {t('resumePreview')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl gap-0 overflow-hidden p-0">
              <DialogHeader className="border-b border-border/60 px-4 py-3">
                <DialogTitle className="text-base">{saved.fileName}</DialogTitle>
              </DialogHeader>
              <iframe
                src={buildAdminResumePreviewSrc(draftUrl)}
                title={t('resumePreview')}
                className="h-[70vh] w-full bg-muted/30"
              />
            </DialogContent>
          </Dialog>
        )}

        {saved && (
          <Button
            type="button"
            variant="destructive"
            disabled={saving || deleting}
            onClick={() => void handleDelete()}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t('resumeDelete')}
          </Button>
        )}
      </div>

      {saved && !hasUnsavedUpload && (
        <a
          href={saved.url}
          download={saved.fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
        >
          <FileDown className="h-4 w-4" />
          {t('resumeDownloadCurrent')}
        </a>
      )}
    </ContentCard>
  );
}
