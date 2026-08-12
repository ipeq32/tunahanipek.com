'use client';

import { ImageLightbox } from '@/components/media/image-lightbox';

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
  return (
    <ImageLightbox
      open={open && Boolean(src)}
      images={src ? [src] : []}
      activeIndex={0}
      title={alt}
      imageAlt={() => alt}
      onClose={() => onOpenChange(false)}
    />
  );
}
