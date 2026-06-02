import { Link } from '@/navigation';
import { getPublishedBlogs } from '@/lib/data/blogs';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  const { data: recentBlogs } = await getPublishedBlogs(1, 3);

  return (
    <div className="py-10 space-y-10">
      <section className="space-y-4 max-w-2xl">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/blog">{t('ctaBlog')}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/about-me">{t('ctaAbout')}</Link>
          </Button>
        </div>
      </section>

      {recentBlogs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t('recentPosts')}</h2>
          <ul className="space-y-3">
            {recentBlogs.map((blog) => (
              <li key={blog.id}>
                <Link
                  href={{ pathname: '/blog/[id]', params: { id: blog.id } }}
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {blog.title}
                </Link>
                <span className="text-xs text-muted-foreground ml-2">
                  — {blog.author.name}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
