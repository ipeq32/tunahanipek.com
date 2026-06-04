"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { SiteContainer } from "@/app/_components/layout/SiteContainer";
import { Link } from "@/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <SiteContainer
      as="main"
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("description")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn-dark">
          {t("retry")}
        </button>
        <Link href="/" className="btn-outline">
          {t("home")}
        </Link>
      </div>
    </SiteContainer>
  );
}
