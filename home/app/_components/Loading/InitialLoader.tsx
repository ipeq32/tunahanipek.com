"use client";

import { useEffect, useState } from "react";
import Loading from "./Loading";

const MIN_VISIBLE_MS = 1400;
const FAILSAFE_MS = 6000;

type InitialLoaderProps = {
  children: React.ReactNode;
};

const InitialLoader = ({ children }: InitialLoaderProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let isUnmounted = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (media.matches) {
      setIsVisible(false);
      return;
    }

    const hide = () => {
      if (!isUnmounted) {
        setIsVisible(false);
      }
    };

    const minTimer = window.setTimeout(hide, MIN_VISIBLE_MS);
    const failSafeTimer = window.setTimeout(hide, FAILSAFE_MS);

    return () => {
      isUnmounted = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(failSafeTimer);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <div
          className={`fixed inset-0 z-[100] transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Loading />
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </>
  );
};

export default InitialLoader;
