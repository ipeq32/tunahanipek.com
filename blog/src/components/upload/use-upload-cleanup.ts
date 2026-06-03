'use client';

import { useCallback, useEffect, useRef } from 'react';

const DELETE_ENDPOINT = '/api/uploadthing/delete';

/**
 * UploadThing'den dosya silinmesini ister. Temizleme arka plan işlemi olduğu
 * için hatalar kullanıcıya yansıtılmaz. `keepalive`, sayfa kapanırken/yönlendirme
 * sırasında isteğin tamamlanmasını sağlar.
 */
async function requestDelete(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    await fetch(DELETE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
      keepalive: true,
    });
  } catch {
    // Sessizce geçilir; orphan temizliği kullanıcı akışını bozmamalı.
  }
}

export type UploadCleanup = {
  /** Bu oturumda yüklenen (henüz kaydedilmemiş) bir dosyayı izlemeye alır. */
  track: (url: string) => void;
  /** İzlenen bir dosyayı kullanım dışı bırakır ve hemen siler (değiştir/kaldır). */
  release: (url: string) => void;
  /** Form başarıyla gönderildiğinde izlenen dosyaları kalıcı işaretler. */
  commit: () => void;
};

/**
 * Form oturumu boyunca yüklenen ama kaydedilmeyen görselleri yönetir. Form
 * gönderilmeden bileşen ayrıldığında (iptal/yönlendirme) izlenen dosyalar
 * UploadThing'den silinerek orphan dosya birikmesi önlenir.
 */
export function useUploadCleanup(): UploadCleanup {
  const pending = useRef<Set<string>>(new Set());

  const track = useCallback((url: string) => {
    if (url) pending.current.add(url);
  }, []);

  const release = useCallback((url: string) => {
    if (url && pending.current.delete(url)) {
      void requestDelete([url]);
    }
  }, []);

  const commit = useCallback(() => {
    pending.current.clear();
  }, []);

  useEffect(() => {
    const tracked = pending.current;
    return () => {
      if (tracked.size > 0) {
        void requestDelete([...tracked]);
        tracked.clear();
      }
    };
  }, []);

  return { track, release, commit };
}
