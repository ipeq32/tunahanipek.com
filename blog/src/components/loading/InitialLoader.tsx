'use client';

import { useEffect, useState } from 'react';
import Loading from '@/components/loading/Loading';
import { AppReadyProvider } from '@/context/app-ready-context';

const MIN_VISIBLE_MS = 1400;
const FAILSAFE_MS = 6000;
const FADE_MS = 500;

type InitialLoaderProps = {
  children: React.ReactNode;
};

const InitialLoader = ({ children }: InitialLoaderProps) => {
  const [overlay, setOverlay] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    let isUnmounted = false;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const finish = () => {
      if (!isUnmounted) {
        setOverlay('hidden');
      }
    };

    if (media.matches) {
      finish();
      return;
    }

    const startFade = () => {
      if (!isUnmounted) {
        setOverlay('fading');
      }
    };

    const minTimer = window.setTimeout(startFade, MIN_VISIBLE_MS);
    const failSafeTimer = window.setTimeout(startFade, FAILSAFE_MS);

    return () => {
      isUnmounted = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(failSafeTimer);
    };
  }, []);

  useEffect(() => {
    if (overlay !== 'fading') {
      return;
    }

    const readyTimer = window.setTimeout(() => {
      setOverlay('hidden');
    }, FADE_MS);

    return () => window.clearTimeout(readyTimer);
  }, [overlay]);

  const appReady = overlay === 'hidden';

  return (
    <AppReadyProvider ready={appReady}>
      {overlay !== 'hidden' ? (
        <div
          className={`preloader-overlay transition-opacity duration-500 ${
            overlay === 'fading' ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <Loading />
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </AppReadyProvider>
  );
};

export default InitialLoader;
