import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { ContentCard } from '@/components/layout/content-card';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Pages.About' });
  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    route: '/about-me',
  });
}
import { Badge } from '@/components/ui/badge';
import { DidYouKnow } from '@/components/ui/did-you-know';
import { Link } from '@/navigation';
import {
  ArrowRight,
  Briefcase,
  FileDown,
  GraduationCap,
  Languages,
  MapPin,
  Rocket,
  Wrench,
} from 'lucide-react';
import { getSiteResume } from '@/lib/site-resume';

type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  summary: string;
  points: string[];
};

type EducationItem = {
  school: string;
  field: string;
  period: string;
};

type ProjectItem = {
  name: string;
  description: string;
  stack: string;
};

type TechGroup = {
  label: string;
  items: string[];
};

type LanguageItem = {
  name: string;
  level: string;
};

export default async function AboutPage() {
  const t = await getTranslations('Pages.About');
  const resume = await getSiteResume();

  const highlights = t.raw('highlights') as string[];
  const experience = t.raw('experience') as ExperienceItem[];
  const education = t.raw('education') as EducationItem[];
  const projects = t.raw('projects') as ProjectItem[];
  const techGroups = t.raw('techGroups') as TechGroup[];
  const languages = t.raw('languages') as LanguageItem[];

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />

      <ContentCard className="mt-2">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-3xl font-bold text-white shadow-lg shadow-teal-500/25">
            Tİ
          </div>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t('role')}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-teal-500" aria-hidden />
                {t('location')}
              </span>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">{t('intro')}</p>
            <div className="flex flex-wrap gap-2">
              {highlights.map((item) => (
                <Badge key={item} variant="accent">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </ContentCard>

      {resume && (
        <ContentCard className="mt-6 flex flex-col gap-4 border-teal-500/20 bg-gradient-to-br from-teal-500/[0.04] to-cyan-500/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t('resumeTitle')}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              {t('resumeDescription')}
            </p>
            <p className="text-xs font-medium text-teal-600 dark:text-teal-400">
              {t('resumeFormat')}
            </p>
          </div>
          <a
            href={resume.url}
            download={resume.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/20 transition hover:from-teal-500 hover:to-cyan-500"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            {t('resumeDownload')}
          </a>
        </ContentCard>
      )}

      <section className="mt-10 space-y-5">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-teal-500" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">{t('experienceTitle')}</h2>
        </div>
        <div className="space-y-4">
          {experience.map((item) => (
            <ContentCard key={`${item.company}-${item.period}`} className="p-5 md:p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-semibold text-foreground">{item.company}</h3>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {item.period}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-teal-600 dark:text-teal-400">
                {item.role}
              </p>
              {item.summary && (
                <p className="mt-1 text-xs italic text-muted-foreground">{item.summary}</p>
              )}
              <ul className="mt-3 space-y-2">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500"
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </ContentCard>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-5">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-teal-500" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">{t('educationTitle')}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {education.map((item) => (
            <ContentCard key={item.school} className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-foreground">{item.school}</h3>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {item.period}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.field}</p>
            </ContentCard>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-5">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-teal-500" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">{t('projectsTitle')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t('projectsNote')}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <ContentCard key={project.name} className="flex flex-col gap-3 p-5">
              <h3 className="font-semibold text-foreground">{project.name}</h3>
              <p className="flex-1 text-sm text-muted-foreground">{project.description}</p>
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400">
                {project.stack}
              </p>
            </ContentCard>
          ))}
        </div>
        <Link
          href="/project"
          className="inline-flex items-center text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
        >
          {t('projectsCta')}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </section>

      <section className="mt-10 space-y-5">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-teal-500" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">{t('techTitle')}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {techGroups.map((group) => (
            <ContentCard key={group.label} className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Badge key={item} variant="default">
                    {item}
                  </Badge>
                ))}
              </div>
            </ContentCard>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-5">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-teal-500" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">{t('languagesTitle')}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {languages.map((language) => (
            <ContentCard key={language.name} className="flex items-baseline justify-between gap-3 p-5">
              <h3 className="font-semibold text-foreground">{language.name}</h3>
              <span className="text-sm text-muted-foreground">{language.level}</span>
            </ContentCard>
          ))}
        </div>
      </section>

      <DidYouKnow className="mt-10" />
    </>
  );
}
