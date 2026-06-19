'use client';

import { Camera, Check, Loader2, MonitorSmartphone, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import BlogImage from '@/components/blog/BlogImage';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAiStatus } from '@/hooks/use-ai-status';
import { cn } from '@/lib/utils';
import type { UploadCleanup } from '@/components/upload/use-upload-cleanup';

type CapturePreview = {
  image: string;
  gallery: string[];
  pageTitle: string;
};

type CaptureStep = 'idle' | 'capturing' | 'preview';

type ProjectScreenshotCaptureProps = {
  projectUrl: string;
  hasExistingMedia: boolean;
  disabled?: boolean;
  cleanup?: UploadCleanup;
  onApply: (result: { image: string; gallery: string[] }) => void;
};

type ApiResponse =
  | {
      status: 'requires_auth';
      hints: string[];
      pageTitle?: string;
    }
  | {
      status: 'success';
      image: string;
      gallery: string[];
      pageTitle: string;
    };

export default function ProjectScreenshotCapture({
  projectUrl,
  hasExistingMedia,
  disabled,
  cleanup,
  onApply,
}: ProjectScreenshotCaptureProps) {
  const t = useTranslations('Content.ProjectScreenshots');
  const { available: aiAvailable, loading: aiStatusLoading } = useAiStatus();
  const [step, setStep] = useState<CaptureStep>('idle');
  const [preview, setPreview] = useState<CapturePreview | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authHints, setAuthHints] = useState<string[]>([]);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);

  const urlReady = Boolean(projectUrl.trim());

  async function requestCapture(proceedDespiteAuth = false) {
    if (!urlReady) {
      toast.error(t('urlRequired'));
      return;
    }

    setStep('capturing');

    try {
      const res = await fetch('/api/ai/project-screenshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: projectUrl.trim(),
          proceedDespiteAuth,
        }),
      });

      const json = (await res.json()) as {
        data?: ApiResponse;
        error?: string;
      };

      if (!res.ok) {
        toast.error(json.error ?? t('captureError'));
        setStep('idle');
        return;
      }

      if (json.data?.status === 'requires_auth') {
        setAuthHints(json.data.hints);
        setAuthDialogOpen(true);
        setStep('idle');
        return;
      }

      if (json.data?.status === 'success') {
        setPreview({
          image: json.data.image,
          gallery: json.data.gallery,
          pageTitle: json.data.pageTitle,
        });
        setStep('preview');
        toast.success(t('captureSuccess'));
        return;
      }

      toast.error(t('captureError'));
      setStep('idle');
    } catch {
      toast.error(t('captureError'));
      setStep('idle');
    }
  }

  function handleStartCapture() {
    if (hasExistingMedia) {
      setReplaceDialogOpen(true);
      return;
    }
    void requestCapture(false);
  }

  function applyPreview() {
    if (!preview) return;

    cleanup?.track(preview.image);
    preview.gallery.forEach((url) => {
      if (url !== preview.image) {
        cleanup?.track(url);
      }
    });

    onApply({
      image: preview.image,
      gallery: preview.gallery,
    });

    setPreview(null);
    setStep('idle');
    toast.success(t('applied'));
  }

  function discardPreview() {
    if (preview) {
      cleanup?.release(preview.image);
      preview.gallery.forEach((url) => {
        if (url !== preview.image) {
          cleanup?.release(url);
        }
      });
    }
    setPreview(null);
    setStep('idle');
  }

  if (aiStatusLoading) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-teal-500/25',
          'bg-gradient-to-br from-teal-500/[0.08] via-cyan-500/[0.05] to-emerald-500/[0.08]',
        )}
      >
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <MonitorSmartphone className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold text-foreground">{t('cardTitle')}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('cardDescription')}
              </p>
              {!aiAvailable && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {t('aiFallbackHint')}
                </p>
              )}
            </div>
          </div>

          {step === 'preview' && preview && (
            <div className="space-y-3 rounded-lg border border-border/50 bg-background/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {preview.pageTitle}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
                  <Sparkles className="h-3 w-3" />
                  {t('aiSelected', { count: preview.gallery.length })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {preview.gallery.map((url, index) => {
                  const isCover = url === preview.image;
                  return (
                    <div
                      key={url}
                      className={cn(
                        'relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30',
                        isCover
                          ? 'border-teal-500/60 ring-2 ring-teal-500/20'
                          : 'border-border/60',
                      )}
                    >
                      <BlogImage
                        src={url}
                        alt={t('previewAlt', { index: index + 1 })}
                        fill
                        className="object-cover"
                      />
                      {isCover && (
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-teal-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {t('coverBadge')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="accent"
                  onClick={applyPreview}
                  disabled={disabled}
                >
                  <Check className="h-4 w-4" />
                  {t('applyButton')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={discardPreview}
                  disabled={disabled}
                  className="bg-background/70"
                >
                  <X className="h-4 w-4" />
                  {t('discardButton')}
                </Button>
              </div>
            </div>
          )}

          {step !== 'preview' && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || !urlReady || step === 'capturing'}
                onClick={handleStartCapture}
                className="border-teal-500/30 bg-background/70 hover:bg-teal-500/[0.06]"
              >
                {step === 'capturing' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {step === 'capturing' ? t('capturing') : t('captureButton')}
              </Button>
              {!urlReady && (
                <span className="text-xs text-muted-foreground">{t('urlHint')}</span>
              )}
            </div>
          )}

          {step === 'capturing' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-500" />
              {t('capturingSteps')}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        title={t('authDialogTitle')}
        description={
          <span>
            {t('authDialogDescription')}
            {authHints.length > 0 && (
              <span className="mt-2 block text-xs text-muted-foreground">
                {t('authDialogHints', { hints: authHints.join(', ') })}
              </span>
            )}
          </span>
        }
        confirmLabel={t('authDialogConfirm')}
        cancelLabel={t('authDialogCancel')}
        destructive={false}
        confirmVariant="accent"
        onConfirm={async () => {
          setAuthDialogOpen(false);
          await requestCapture(true);
        }}
      />

      <ConfirmDialog
        open={replaceDialogOpen}
        onOpenChange={setReplaceDialogOpen}
        title={t('replaceDialogTitle')}
        description={t('replaceDialogDescription')}
        confirmLabel={t('replaceDialogConfirm')}
        cancelLabel={t('replaceDialogCancel')}
        destructive={false}
        confirmVariant="accent"
        onConfirm={async () => {
          setReplaceDialogOpen(false);
          await requestCapture(false);
        }}
      />
    </>
  );
}
