"use client";

import { useEffect, useState } from "react";

import { PageReadyProvider } from "@/app/_context/PageReadyContext";
import Loading from "./Loading";

const MIN_VISIBLE_MS = 400;
const FAILSAFE_MS = 6000;
const FADE_MS = 500;
const SESSION_KEY = "home-initial-loader-done";

type InitialLoaderProps = {
  children: React.ReactNode;
};

const InitialLoader = ({ children }: InitialLoaderProps) => {
  const [overlay, setOverlay] = useState<"visible" | "fading" | "hidden">(
    "visible",
  );
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setOverlay("hidden");
      setIsPageReady(true);
    }
  }, []);

  useEffect(() => {
    if (overlay === "hidden") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, [overlay]);

  useEffect(() => {
    if (overlay === "hidden" || isPageReady) {
      return;
    }

    let isUnmounted = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const finish = () => {
      if (!isUnmounted) {
        setOverlay("hidden");
        setIsPageReady(true);
      }
    };

    if (media.matches) {
      finish();
      return;
    }

    const startFade = () => {
      if (!isUnmounted) {
        setOverlay("fading");
      }
    };

    const minTimer = window.setTimeout(startFade, MIN_VISIBLE_MS);
    const failSafeTimer = window.setTimeout(startFade, FAILSAFE_MS);

    return () => {
      isUnmounted = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(failSafeTimer);
    };
  }, [overlay, isPageReady]);

  useEffect(() => {
    if (overlay !== "fading" || isPageReady) {
      return;
    }

    const readyTimer = window.setTimeout(() => {
      setOverlay("hidden");
      setIsPageReady(true);
    }, FADE_MS);

    return () => window.clearTimeout(readyTimer);
  }, [overlay, isPageReady]);

  return (
    <PageReadyProvider ready={isPageReady}>
      {overlay !== "hidden" ? (
        <div
          className={`preloader-overlay transition-opacity duration-500 ${
            overlay === "fading"
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }`}
        >
          <Loading />
        </div>
      ) : null}
      <div className="flex min-h-dvh flex-1 flex-col">{children}</div>
    </PageReadyProvider>
  );
};

export default InitialLoader;
