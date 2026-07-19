'use client';

import BlogImage from '@/components/blog/BlogImage';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ImagePreviewDialogProps = {
  src: string | null;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImagePreviewDialog({
  src,
  alt,
  open,
  onOpenChange,
}: ImagePreviewDialogProps) {
  const isBlob = src?.startsWith('blob:') ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-[min(96vw,56rem)] gap-0 border-white/10 bg-black/95 p-2 sm:p-4',
          '[&>button]:text-white/80 [&>button]:hover:text-white',
        )}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {src ? (
          <div className="flex max-h-[85vh] min-h-[12rem] items-center justify-center">
            {isBlob ? (
              <img
                src={src}
                alt={alt}
                className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="relative h-[min(85vh,720px)] w-full min-w-[min(96vw,48rem)]">
                <BlogImage
                  src={src}
                  alt={alt}
                  fill
                  sizes="96vw"
                  quality={95}
                  priority
                  className="object-contain"
                />
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
