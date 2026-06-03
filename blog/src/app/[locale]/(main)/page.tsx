import { Link } from '@/navigation';
import { getPublishedBlogs } from '@/lib/data/blogs';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import BlogCard from '@/components/blog/BlogCard';
import { DidYouKnow } from '@/components/ui/did-you-know';
import { ArrowRight, PenLine } from 'lucide-react';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  const { data: recentBlogs } = await getPublishedBlogs(1, 3);

  return (
    <div className="space-y-12 py-6 md:py-8">
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
              <Link href="/about-me">{t('ctaAbout')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <DidYouKnow size="lg" />

      {recentBlogs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">{t('recentPosts')}</h2>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-teal-600 hover:bg-teal-500/10 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
            >
              <Link href="/blog">
                {t('ctaBlog')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
