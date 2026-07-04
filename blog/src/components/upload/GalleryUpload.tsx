'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Trash2, ZoomIn } from 'lucide-react';
import BlogImage from '@/components/blog/BlogImage';
import { useUploadThing } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { UPLOAD_CONFIG, type ImageUploadEndpoint } from '@/lib/upload-config';
import { compressImage } from '@/lib/image-compression';
import type { UploadCleanup } from '@/components/upload/use-upload-cleanup';
import { useImageDropPaste } from '@/components/upload/use-image-drop-paste';

const DEFAULT_MAX_IMAGES = 12;

type GalleryUploadProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
  endpoint?: ImageUploadEndpoint;
  cleanup?: UploadCleanup;
};

export default function GalleryUpload({
  value,
  onChange,
  disabled,
  maxImages = DEFAULT_MAX_IMAGES,
  endpoint = 'projectImageUploader',
  cleanup,
}: GalleryUploadProps) {
  const t = useTranslations('Upload.Gallery');
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);

  const remaining = maxImages - value.length;
  const canAdd = remaining > 0;

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onUploadProgress: setProgress,
    onClientUploadComplete: (res) => {
      const urls = res.map((file) => file.ufsUrl).filter(Boolean) as string[];
      if (urls.length === 0) return;

      const allowed = urls.slice(0, remaining);
      allowed.forEach((url) => cleanup?.track(url));
      onChange([...value, ...allowed]);
      toast.success(t('success', { count: allowed.length }));
      setProgress(0);
    },
    onUploadError: () => {
      toast.error(t('error'));
      setProgress(0);
    },
  });

  const busy = isUploading || isCompressing;

  const openPicker = () => {
    if (disabled || busy || !canAdd) return;
    inputRef.current?.click();
  };

  const handleRemove = (url: string) => {
    cleanup?.release(url);
    onChange(value.filter((item) => item !== url));
  };

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files.length || !canAdd) return;

      const selected = files.slice(0, remaining);
      const { maxFileSizeBytes, maxFileSizeLabel, compression } =
        UPLOAD_CONFIG[endpoint];

      const prepared: File[] = [];

      try {
        setIsCompressing(true);
        for (const file of selected) {
          let fileToUpload = file;
          if (file.size > maxFileSizeBytes) {
            fileToUpload = await compressImage(file, compression);
          }
          if (fileToUpload.size > maxFileSizeBytes) {
            toast.error(t('tooLarge', { size: maxFileSizeLabel }));
            continue;
          }
          prepared.push(fileToUpload);
        }
      } catch {
        toast.error(t('compressFailed'));
        return;
      } finally {
        setIsCompressing(false);
      }

      if (prepared.length === 0) return;
      await startUpload(prepared);
    },
    [canAdd, endpoint, remaining, startUpload, t],
  );

  const { zoneRef, isDragging, dropZoneProps } = useImageDropPaste({
    disabled: disabled || busy || !canAdd,
    multiple: true,
    onFiles: (files) => {
      void handleFiles(files);
    },
  });

  const handleSelect = async (files: FileList | null) => {
    if (!files?.length) return;
    await handleFiles(Array.from(files));
  };

  const dropHighlightClass =
    isDragging && !busy
      ? 'border-teal-500 bg-teal-500/[0.08] ring-2 ring-teal-500/25'
      : '';

  return (
    <div ref={zoneRef} className="space-y-3" {...dropZoneProps}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleSelect(event.target.files);
          event.target.value = '';
        }}
      />

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-muted/30 shadow-sm"
            >
              <BlogImage
                src={url}
                alt={t('previewAlt', { index: index + 1 })}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  disabled={disabled || busy}
                  onClick={() => handleRemove(url)}
                  aria-label={t('remove')}
                  title={t('remove')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/90 text-white backdrop-blur-sm transition hover:bg-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                <ZoomIn className="h-3 w-3" />
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={openPicker}
          className={cn(
            'relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border/70 bg-background/40 px-4 py-8 text-center transition hover:border-teal-500/50 hover:bg-teal-500/[0.03] disabled:cursor-not-allowed disabled:opacity-60',
            dropHighlightClass,
          )}
        >
          {busy ? (
            <UploadingState
              progress={progress}
              compressing={isCompressing}
              t={t}
            />
          ) : (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <ImagePlus className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">
                {t('cta')}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('hint', { remaining, max: maxImages })}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

type UploadingStateProps = {
  progress: number;
  compressing: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
};

function UploadingState({ progress, compressing, t }: UploadingStateProps) {
  const rounded = Math.round(progress);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2 text-sm text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
      <span className="font-medium">
        {compressing ? t('compressing') : `${t('uploading')} ${rounded}%`}
      </span>
      {!compressing && (
        <div className="h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-200"
            style={{ width: `${rounded}%` }}
          />
        </div>
      )}
    </div>
  );
}
