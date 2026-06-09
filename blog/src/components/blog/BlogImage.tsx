'use client';

import {
  BLOG_IMAGE_FALLBACK,
  resolveBlogImageCandidates,
} from '@/lib/blog-image';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type BlogImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src?: string | null;
  /** Liste küçük görseli yüklenemezse denenecek tam kapak URL'si */
  fallbackSrc?: string | null;
};

export default function BlogImage({
  src,
  fallbackSrc,
  alt,
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

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized
      onError={() => {
        setCandidateIndex((index) =>
          index < candidates.length - 1 ? index + 1 : index,
        );
      }}
    />
  );
}
