import type { Metadata } from 'next';
import { Link } from '@/navigation';
import { getPublishedBlogs } from '@/lib/data/blogs';
import { getPublishedProjects } from '@/lib/data/projects';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/page-metadata';
import { JsonLd } from '@/components/json-ld';
import { buildPersonJsonLd, buildWebSiteJsonLd } from '@/lib/json-ld';
import { Button } from '@/components/ui/button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const base = buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    route: '/',
  });
  return { ...base, title: { absolute: t('title') } };
}
import BlogCard from '@/components/blog/BlogCard';
import ProjectCard from '@/components/project/ProjectCard';
import { DidYouKnow } from '@/components/ui/did-you-know';
import {
  ArrowRight,
  FileText,
  FolderGit2,
  type LucideIcon,
  PenLine,
  Sparkles,
  Tags,
} from 'lucide-react';

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-5 py-4 shadow-sm backdrop-blur-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none tabular-nums">{value}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: '/blog' | '/project';
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="text-teal-600 hover:bg-teal-500/10 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
      >
        <Link href={href}>
          {linkLabel}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('HomePage');
  const tProject = await getTranslations('Pages.Project');

  const [{ data: recentBlogs, total: postsTotal }, projects, topicsCount] =
    await Promise.all([
      getPublishedBlogs(1, 3),
      getPublishedProjects(),
      prisma.category.count({ where: { deletedAt: null } }),
    ]);

  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="space-y-12 py-6 md:py-8">
      <JsonLd data={buildWebSiteJsonLd(locale)} />
      <JsonLd data={buildPersonJsonLd()} />
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-8 shadow-sm backdrop-blur-sm md:p-10">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300">
            <PenLine className="h-3.5 w-3.5" />
            {t('badge')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            <span className="text-gradient">{t('title')}</span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            {t('description')}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="accent" size="lg" asChild>
              <Link href="/blog">
                {t('ctaBlog')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/project">{t('ctaProjects')}</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/about-me">{t('ctaAbout')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} value={postsTotal} label={t('statPosts')} />
        <StatCard
          icon={FolderGit2}
          value={projects.length}
          label={t('statProjects')}
        />
        <StatCard icon={Tags} value={topicsCount} label={t('statTopics')} />
      </section>

      {featuredProjects.length > 0 && (
        <section className="space-y-6">
          <SectionHeading
            title={t('featuredProjects')}
            href="/project"
            linkLabel={t('viewAll')}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                visitLabel={tProject('visit')}
              />
            ))}
          </div>
        </section>
      )}

      {recentBlogs.length > 0 && (
        <section className="space-y-6">
          <SectionHeading
            title={t('recentPosts')}
            href="/blog"
            linkLabel={t('ctaBlog')}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      <DidYouKnow size="lg" />

      <section className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-transparent p-8 text-center shadow-sm md:p-12">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-xl flex-col items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t('ctaSectionTitle')}
          </h2>
          <p className="text-muted-foreground">{t('ctaSectionDescription')}</p>
          <Button variant="accent" size="lg" asChild className="mt-1">
            <Link href="/contact">
              {t('ctaContact')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
