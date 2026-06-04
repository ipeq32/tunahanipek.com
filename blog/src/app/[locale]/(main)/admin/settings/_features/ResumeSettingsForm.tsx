'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { FileDown, Loader2, Trash2 } from 'lucide-react';
import PdfUpload from '@/components/upload/PdfUpload';
import { useUploadCleanup } from '@/components/upload/use-upload-cleanup';
import { AdminListCard } from '@/components/admin/admin-ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ResumeData = {
  url: string;
  fileName: string;
  updatedAt: string;
};

function ensurePdfFileName(name: string): string {
  const trimmed = name.trim() || 'resume.pdf';
  return trimmed.toLowerCase().endsWith('.pdf') ? trimmed : `${trimmed}.pdf`;
}

export default function ResumeSettingsForm() {
  const t = useTranslations('Admin.Settings');
  const cleanup = useUploadCleanup();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState<ResumeData | null>(null);
  const [draftUrl, setDraftUrl] = useState('');
  const [draftFileName, setDraftFileName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resume');
      if (!res.ok) throw new Error('load failed');
      const json = (await res.json()) as { data: ResumeData | null };
      setSaved(json.data);
      if (json.data) {
        setDraftUrl(json.data.url);
        setDraftFileName(json.data.fileName);
      } else {
        setDraftUrl('');
        setDraftFileName('');
      }
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDraftChange = (url: string, fileName: string) => {
    setDraftUrl(url);
    setDraftFileName(fileName);
  };

  const hasUnsavedUpload =
    Boolean(draftUrl) &&
    (!saved || draftUrl !== saved.url || draftFileName !== saved.fileName);

  const handleSave = async () => {
    if (!draftUrl) {
      toast.error(t('noFile'));
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
      toast.success(t('saved'));
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('deleteConfirm'))) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/resume', { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');

      cleanup.commit();
      setSaved(null);
      setDraftUrl('');
      setDraftFileName('');
      toast.success(t('deleted'));
    } catch {
      toast.error(t('deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminListCard className="mt-6 flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        <span className="sr-only">{t('loading')}</span>
      </AdminListCard>
    );
  }

  return (
    <AdminListCard className="mt-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('resumeTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('resumeDescription')}</p>
        {saved && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t('lastUpdated', {
              date: new Date(saved.updatedAt).toLocaleString(),
            })}
          </p>
        )}
      </div>

      {saved && hasUnsavedUpload && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          {t('replaceWarning')}
        </p>
      )}

      <PdfUpload
        value={draftUrl || undefined}
        fileName={draftFileName || undefined}
        onChange={handleDraftChange}
        disabled={saving || deleting}
        cleanup={cleanup}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="accent"
          disabled={!hasUnsavedUpload || saving || deleting}
          onClick={() => void handleSave()}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t('save')}
        </Button>

        {saved && draftUrl && (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                {t('preview')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl gap-0 overflow-hidden p-0">
              <DialogHeader className="border-b border-border/60 px-4 py-3">
                <DialogTitle className="text-base">{saved.fileName}</DialogTitle>
              </DialogHeader>
              <iframe
                src={draftUrl}
                title={t('preview')}
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
            {t('delete')}
          </Button>
        )}
      </div>

      {saved && !hasUnsavedUpload && (
        <a
          href={saved.url}
          download={saved.fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
        >
          <FileDown className="h-4 w-4" />
          {t('downloadCurrent')}
        </a>
      )}
    </AdminListCard>
  );
}
