'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { UPLOAD_CONFIG } from '@/lib/upload-config';
import type { UploadCleanup } from '@/components/upload/use-upload-cleanup';

type PdfUploadProps = {
  value?: string;
  fileName?: string;
  onChange: (url: string, fileName: string) => void;
  disabled?: boolean;
  className?: string;
  cleanup?: UploadCleanup;
};

export default function PdfUpload({
  value,
  fileName,
  onChange,
  disabled,
  className,
  cleanup,
}: PdfUploadProps) {
  const t = useTranslations('Upload.Pdf');
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [pendingName, setPendingName] = useState<string | undefined>();

  const { startUpload, isUploading } = useUploadThing('cvUploader', {
    onUploadProgress: setProgress,
    onClientUploadComplete: (res) => {
      const file = res?.[0];
      const url = file?.ufsUrl;
      const name = file?.name ?? pendingName ?? 'resume.pdf';

      if (url) {
        if (value) cleanup?.release(value);
        cleanup?.track(url);
        onChange(url, name);
        toast.success(t('success'));
      }
      setProgress(0);
      setPendingName(undefined);
    },
    onUploadError: () => {
      toast.error(t('error'));
      setProgress(0);
      setPendingName(undefined);
    },
  });

  const handleRemove = () => {
    if (value) cleanup?.release(value);
    onChange('', '');
    setPendingName(undefined);
  };

  const busy = isUploading;

  const openPicker = () => {
    if (disabled || busy) return;
    inputRef.current?.click();
  };

  const handleSelect = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error(t('invalidType'));
      return;
    }

    const { maxFileSizeBytes, maxFileSizeLabel } = UPLOAD_CONFIG.cvUploader;

    if (file.size > maxFileSizeBytes) {
      toast.error(t('tooLarge', { size: maxFileSizeLabel }));
      return;
    }

    setPendingName(file.name);
    await startUpload([file]);
  };

  const displayName = fileName || pendingName;

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => {
          void handleSelect(event.target.files);
          event.target.value = '';
        }}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {displayName ?? t('uploaded')}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                {t('ready')}
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground transition hover:text-teal-600 dark:hover:text-teal-400"
                aria-label={t('preview')}
                title={t('preview')}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                type="button"
                disabled={disabled || busy}
                onClick={openPicker}
                aria-label={t('replace')}
                title={t('replace')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground transition hover:text-teal-600 disabled:opacity-50 dark:hover:text-teal-400"
              >
                <UploadCloud className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={disabled || busy}
                onClick={handleRemove}
                aria-label={t('remove')}
                title={t('remove')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 transition hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('uploading')} {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={openPicker}
          className="relative flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/40 px-4 py-10 text-center transition hover:border-teal-500/50 hover:bg-teal-500/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('uploading')} {Math.round(progress)}%
              </span>
            </>
          ) : (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <FileText className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">{t('cta')}</span>
              <span className="text-xs text-muted-foreground">{t('hint')}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
