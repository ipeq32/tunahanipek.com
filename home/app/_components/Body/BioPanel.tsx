"use client";

import { usePageReady } from "@/app/_context/PageReadyContext";
import { site } from "@/app/_content/site";

const BioPanel = () => {
  const isReady = usePageReady();

  return (
    <section className="min-h-0 text-center md:text-left">
      <div className={isReady ? "bio-animate" : "bio-pending"}>
        <div className="bio-panel rounded-3xl border border-white/80 bg-white/75 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-md sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-700/80">
            Profil Özeti
          </p>
          <div className="space-y-3 text-base leading-relaxed text-slate-700 md:text-sm lg:text-[0.95rem] lg:leading-7">
            {site.bio.map((paragraph) => (
              <p key={paragraph} className="bio-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BioPanel;
