'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import BlogImage from '@/components/blog/BlogImage';
import { useUploadThing } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { UPLOAD_CONFIG, type ImageUploadEndpoint } from '@/lib/upload-config';
import { compressImage } from '@/lib/image-compression';
import type { UploadCleanup } from '@/components/upload/use-upload-cleanup';

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  heightClassName?: string;
  endpoint?: ImageUploadEndpoint;
  variant?: 'rect' | 'avatar';
  /**
   * Verildiğinde, oturumda yüklenen görseller izlenir; form gönderilmeden
   * iptal edilir/değiştirilirse orphan dosyalar otomatik silinir.
   */
  cleanup?: UploadCleanup;
};

export default function ImageUpload({
  value,
  onChange,
  disabled,
  className,
  heightClassName = 'h-44',
  endpoint = 'imageUploader',
  variant = 'rect',
  cleanup,
}: ImageUploadProps) {
  const t = useTranslations('Upload');
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onUploadProgress: setProgress,
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl;
      if (url) {
        // Mevcut görsel bu oturumda yüklenmişse (değiştirme), onu hemen sil.
        if (value) cleanup?.release(value);
        cleanup?.track(url);
        onChange(url);
        toast.success(t('success'));
      }
      setProgress(0);
    },
    onUploadError: () => {
      toast.error(t('error'));
      setProgress(0);
    },
  });

  const handleRemove = () => {
    if (value) cleanup?.release(value);
    onChange('');
  };

  const busy = isUploading || isCompressing;

  const openPicker = () => {
    if (disabled || busy) return;
    inputRef.current?.click();
  };

  const handleSelect = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const { maxFileSizeBytes, maxFileSizeLabel, compression } =
      UPLOAD_CONFIG[endpoint];

    let fileToUpload = file;

    // Büyük görselleri yükleme öncesi tarayıcıda sıkıştırıp boyutlandırarak hem
    // bant genişliğinden tasarruf ederiz hem de sunucu limitine takılmayı önleriz.
    if (file.size > maxFileSizeBytes) {
      try {
        setIsCompressing(true);
        fileToUpload = await compressImage(file, compression);
      } catch {
        toast.error(t('compressFailed'));
        return;
      } finally {
        setIsCompressing(false);
      }
    }

    // Sıkıştırma sonrası hâlâ limitin üzerindeyse (ör. zaten yoğun sıkıştırılmış
    // bir görsel) kullanıcıyı net biçimde bilgilendiririz.
    if (fileToUpload.size > maxFileSizeBytes) {
      toast.error(t('tooLarge', { size: maxFileSizeLabel }));
      return;
    }

    await startUpload([fileToUpload]);
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(event) => {
        void handleSelect(event.target.files);
        event.target.value = '';
      }}
    />
  );

  if (variant === 'avatar') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        {fileInput}
        <div className="group relative h-28 w-28">
          {value ? (
            <div className="relative h-full w-full overflow-hidden rounded-full border border-border/60 bg-muted/30 shadow-sm ring-2 ring-teal-500/20">
              <BlogImage
                key={value}
                src={value}
                alt="avatar preview"
                fill
                className="object-cover"
              />
              {busy && (
                <UploadingOverlay
                  progress={progress}
                  t={t}
                  avatar
                  compressing={isCompressing}
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled || busy}
              onClick={openPicker}
              className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-full border border-dashed border-border/70 bg-background/40 text-center transition hover:border-teal-500/50 hover:bg-teal-500/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <UploadingOverlay
                  progress={progress}
                  t={t}
                  avatar
                  compressing={isCompressing}
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <ImagePlus className="h-4 w-4" />
                </span>
              )}
            </button>
          )}

          {value && !busy && (
            <div className="absolute -bottom-1 -right-1 flex gap-1">
              <button
                type="button"
                disabled={disabled}
                onClick={openPicker}
                aria-label={t('replace')}
                title={t('replace')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white shadow-md transition hover:bg-teal-700 disabled:opacity-50"
              >
                <UploadCloud className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleRemove}
                aria-label={t('remove')}
                title={t('remove')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{t('avatarHint')}</span>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {fileInput}

      {value ? (
        <div
          className={cn(
            'group relative w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30 shadow-sm',
            heightClassName
          )}
        >
          <BlogImage
            key={value}
            src={value}
            alt="upload preview"
            fill
            className="object-cover"
          />

          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              disabled={disabled || busy}
              onClick={openPicker}
              aria-label={t('replace')}
              title={t('replace')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={disabled || busy}
              onClick={handleRemove}
              aria-label={t('remove')}
              title={t('remove')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/80 text-white backdrop-blur-sm transition hover:bg-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/65 via-black/20 to-transparent px-3 pb-2.5 pt-8">
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />
            <span className="text-xs font-medium text-white/90">
              {t('uploaded')}
            </span>
          </div>

          {busy && (
            <UploadingOverlay
              progress={progress}
              t={t}
              compressing={isCompressing}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={openPicker}
          className={cn(
            'relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border/70 bg-background/40 px-4 text-center transition hover:border-teal-500/50 hover:bg-teal-500/[0.03] disabled:cursor-not-allowed disabled:opacity-60',
            heightClassName
          )}
        >
          {busy ? (
            <UploadingOverlay
              progress={progress}
              t={t}
              inline
              compressing={isCompressing}
            />
          ) : (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <ImagePlus className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">
                {t('cta')}
              </span>
              <span className="text-xs text-muted-foreground">{t('hint')}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

type UploadingOverlayProps = {
  progress: number;
  t: (key: string) => string;
  inline?: boolean;
  avatar?: boolean;
  compressing?: boolean;
};

function UploadingOverlay({
  progress,
  t,
  inline,
  avatar,
  compressing,
}: UploadingOverlayProps) {
  const rounded = Math.round(progress);

  if (avatar) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-background/80 backdrop-blur-sm">
        <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
        <span className="text-xs font-medium text-muted-foreground">
          {compressing ? t('compressing') : `${rounded}%`}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 text-sm text-muted-foreground',
        !inline && 'absolute inset-0 bg-background/80 backdrop-blur-sm'
      )}
    >
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
