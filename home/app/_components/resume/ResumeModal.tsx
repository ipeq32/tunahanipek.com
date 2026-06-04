"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Download, X } from "lucide-react";

import { site } from "@/app/_content/site";
import { LinkedinIcon } from "@/app/_ui/icons";
import type { PublicResume } from "@/app/_lib/resume";

type ResumeModalProps = {
  open: boolean;
  onClose: () => void;
  resume: PublicResume | null;
};

export default function ResumeModal({
  open,
  onClose,
  resume,
}: ResumeModalProps) {
  const t = useTranslations("ResumeModal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("close")}
        tabIndex={-1}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-modal-title"
        className="relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card text-foreground shadow-2xl"
      >
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="pr-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("eyebrow")}
            </p>
            <h2
              id="resume-modal-title"
              className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              {t("title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {resume ? t("subtitleWithPdf") : t("subtitleNoPdf")}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {resume && (
              <a
                href={resume.url}
                download={resume.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center"
                onClick={onClose}
              >
                <Download className="h-4 w-4" />
                {t("downloadPdf")}
              </a>
            )}

            <a
              href={site.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={
                resume
                  ? "btn-outline w-full justify-center"
                  : "btn-primary w-full justify-center"
              }
              onClick={onClose}
            >
              <LinkedinIcon className="h-4 w-4" />
              {t("viewLinkedIn")}
            </a>

            {!resume && (
              <p className="text-center text-xs text-muted-foreground">
                {t("noPdfHint")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
