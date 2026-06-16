import HomePage from "@/app/_components/HomePage";
import { fetchPublicContact } from "@/app/_lib/contact";
import { fetchPublicResume } from "@/app/_lib/resume";
import { locales } from "@/config";
import { setRequestLocale } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [resume, contact] = await Promise.all([
    fetchPublicResume(),
    fetchPublicContact(),
  ]);

  return <HomePage resume={resume} contact={contact} />;
}
