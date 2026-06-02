'use client';

import { BLOG_IMAGE_FALLBACK, resolveBlogImageUrl } from '@/lib/blog-image';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type BlogImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src?: string | null;
};

export default function BlogImage({ src, alt, ...props }: BlogImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => resolveBlogImageUrl(src));

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized
      onError={() => {
        if (currentSrc !== BLOG_IMAGE_FALLBACK) {
          setCurrentSrc(BLOG_IMAGE_FALLBACK);
        }
      }}
    />
  );
}
