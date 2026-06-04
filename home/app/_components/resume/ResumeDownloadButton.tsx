"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

import type { PublicResume } from "@/app/_lib/resume";
import ResumeModal from "@/app/_components/resume/ResumeModal";

type ResumeDownloadButtonProps = {
  resume: PublicResume | null;
};

export default function ResumeDownloadButton({ resume }: ResumeDownloadButtonProps) {
  const t = useTranslations("Hero");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
        <Download className="h-4 w-4" />
        {t("downloadResume")}
      </button>
      <ResumeModal
        open={open}
        onClose={() => setOpen(false)}
        resume={resume}
      />
    </>
  );
}
