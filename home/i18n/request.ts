import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "../config";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    now: new Date(),
    messages:
      locale === "en"
        ? (await import("../messages/en.json")).default
        : (await import("../messages/tr.json")).default,
  };
});
