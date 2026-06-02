"use client";

import { useEffect, useState } from "react";
import Loading from "./Loading";

/** st1 imza animasyonu ~4s; tam çizim için minimum süre */
const LOADER_MIN_MS = 4000;
const FADE_MS = 500;

type InitialLoaderProps = {
  children: React.ReactNode;
};

const InitialLoader = ({ children }: InitialLoaderProps) => {
  const [phase, setPhase] = useState<"loading" | "fade" | "done">("loading");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setPhase("done");
      return;
    }

    const fadeTimer = window.setTimeout(() => setPhase("fade"), LOADER_MIN_MS);
    const doneTimer = window.setTimeout(
      () => setPhase("done"),
      LOADER_MIN_MS + FADE_MS
    );

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  return (
    <>
      {phase !== "done" && (
        <div
          className={`transition-opacity duration-500 ${
            phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <Loading />
        </div>
      )}
      <div
        className={`flex min-h-0 flex-1 flex-col transition-opacity duration-500 ${
          phase === "loading" ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={phase === "loading"}
      >
        {children}
      </div>
    </>
  );
};

export default InitialLoader;
