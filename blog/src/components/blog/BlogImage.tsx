'use client';

import {
  BLOG_IMAGE_FALLBACK,
  resolveBlogImageCandidates,
} from '@/lib/blog-image';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_FILL_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

/** Next.js default is 75 — too soft for portfolio and screenshot previews */
const DEFAULT_IMAGE_QUALITY = 88;

type BlogImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src?: string | null;
  /** Liste küçük görseli yüklenemezse denenecek tam kapak URL'si */
  fallbackSrc?: string | null;
};

export default function BlogImage({
  src,
  fallbackSrc,
  alt,
  sizes,
  fill,
  quality = DEFAULT_IMAGE_QUALITY,
  ...props
}: BlogImageProps) {
  const candidates = useMemo(
    () => resolveBlogImageCandidates(src, fallbackSrc),
    [src, fallbackSrc],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  const currentSrc =
    candidates[Math.min(candidateIndex, candidates.length - 1)] ??
    BLOG_IMAGE_FALLBACK;

  const resolvedSizes = sizes ?? (fill ? DEFAULT_FILL_SIZES : undefined);

  return (
    <Image
      {...props}
      fill={fill}
      sizes={resolvedSizes}
      quality={quality}
      src={currentSrc}
      alt={alt}
      onError={() => {
        setCandidateIndex((index) =>
          index < candidates.length - 1 ? index + 1 : index,
        );
      }}
    />
  );
}
