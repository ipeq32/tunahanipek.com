'use client';

import { useCallback, useEffect, useState } from 'react';

type AiStatus = {
  available: boolean;
  autoTranslateOnSave: boolean;
};

export function useAiStatus() {
  const [status, setStatus] = useState<AiStatus>({
    available: false,
    autoTranslateOnSave: false,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/status');
      if (!res.ok) {
        setStatus({ available: false, autoTranslateOnSave: false });
        return;
      }
      const json = (await res.json()) as { data: AiStatus };
      setStatus(json.data);
    } catch {
      setStatus({ available: false, autoTranslateOnSave: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...status, loading, refresh };
}
