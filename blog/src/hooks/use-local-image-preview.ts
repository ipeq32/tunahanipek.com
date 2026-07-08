'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function revokeUrl(url: string | null) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function useLocalImagePreview() {
  const urlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const clearPreview = useCallback(() => {
    revokeUrl(urlRef.current);
    urlRef.current = null;
    setPreviewUrl(null);
  }, []);

  const setPreviewFromFile = useCallback((file: File) => {
    revokeUrl(urlRef.current);
    const nextUrl = URL.createObjectURL(file);
    urlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }, []);

  useEffect(() => clearPreview, [clearPreview]);

  return {
    previewUrl,
    setPreviewFromFile,
    clearPreview,
  };
}

type PendingPreview = {
  id: string;
  url: string;
};

export function usePendingGalleryPreviews() {
  const itemsRef = useRef<PendingPreview[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingPreview[]>([]);

  const clearPending = useCallback(() => {
    for (const item of itemsRef.current) {
      revokeUrl(item.url);
    }
    itemsRef.current = [];
    setPendingItems([]);
  }, []);

  const setPendingFromFiles = useCallback((files: File[]) => {
    clearPending();
    const nextItems = files.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
    }));
    itemsRef.current = nextItems;
    setPendingItems(nextItems);
    return nextItems;
  }, [clearPending]);

  useEffect(() => clearPending, [clearPending]);

  return {
    pendingItems,
    setPendingFromFiles,
    clearPending,
  };
}
