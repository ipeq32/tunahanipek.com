'use client';

import { useCallback, useMemo, useState } from 'react';
import { IGetBlog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BlogImage from '@/components/blog/BlogImage';
import { toast } from 'sonner';
import { Link } from '@/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  AdminEmptyState,
  AdminListSkeleton,
  AdminStatusBadge,
} from '@/components/admin/admin-ui';
import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from 'lucide-react';

type AdminBlogListProps = {
  initialBlogs: IGetBlog[];
};

type StatusFilter = 'all' | 'published' | 'drafts';

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-2xl font-bold tabular-nums',
          accent && 'text-teal-600 dark:text-teal-400'
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminBlogList({ initialBlogs }: AdminBlogListProps) {
  const t = useTranslations('Admin.Blog');
  const format = useFormatter();
  const [blogs, setBlogs] = useState<IGetBlog[]>(initialBlogs);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/admin`
      );
      if (!res.ok) throw new Error('Failed to load');
      const { data } = await res.json();
      setBlogs(data);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const togglePublished = async (id: string, published: boolean) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published: !published }),
        }
      );
      if (!res.ok) throw new Error('Update failed');
      toast.success(published ? t('unpublished') : t('published'));
      fetchBlogs();
    } catch {
      toast.error(t('actionError'));
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Delete failed');
      toast.success(t('deleted'));
      fetchBlogs();
    } catch {
      toast.error(t('actionError'));
    }
  };

  const stats = useMemo(() => {
    const published = blogs.filter((b) => b.published).length;
    return {
      total: blogs.length,
      published,
      drafts: blogs.length - published,
    };
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return blogs.filter((blog) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'published' ? blog.published : !blog.published);
      const matchesQuery =
        !query ||
        blog.title.toLowerCase().includes(query) ||
        blog.author.name.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [blogs, search, status]);

  const filters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('filterAll') },
    { value: 'published', label: t('filterPublished') },
    { value: 'drafts', label: t('filterDrafts') },
  ];

  return (
    <div className="mt-6 space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t('statTotal')} value={stats.total} />
        <StatCard label={t('statPublished')} value={stats.published} accent />
        <StatCard label={t('statDrafts')} value={stats.drafts} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border/60 bg-card/60 p-0.5">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  status === filter.value
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={fetchBlogs}
            aria-label={t('refresh')}
            title={t('refresh')}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="accent" size="sm" asChild>
            <Link href="/blog/add" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {t('newBlog')}
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <AdminListSkeleton rows={4} />
      ) : !blogs.length ? (
        <AdminEmptyState message={t('empty')} />
      ) : !filteredBlogs.length ? (
        <AdminEmptyState message={t('noResults')} />
      ) : (
        <div className="space-y-3">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="group flex flex-col gap-4 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm transition hover:border-teal-500/30 sm:flex-row sm:items-center"
            >
              <Link
                href={{ pathname: '/blog/[id]', params: { id: blog.id } }}
                className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border/50 sm:h-20 sm:w-32 sm:shrink-0"
              >
                <BlogImage
                  src={blog.shortImage}
                  alt={blog.title}
                  width={160}
                  height={100}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={{ pathname: '/blog/[id]', params: { id: blog.id } }}
                    className="font-semibold leading-tight hover:text-teal-600 dark:hover:text-teal-400"
                  >
                    {blog.title}
                  </Link>
                  <AdminStatusBadge
                    published={blog.published}
                    publishedLabel={t('statusPublished')}
                    draftLabel={t('statusDraft')}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/70">
                    {blog.author.name}
                  </span>
                  <span aria-hidden>·</span>
                  <time dateTime={new Date(blog.createdAt).toISOString()}>
                    {format.dateTime(new Date(blog.createdAt), {
                      dateStyle: 'medium',
                    })}
                  </time>
                </div>
                {(blog.tags.length > 0 || blog.categories.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="accent" className="text-[10px]">
                        #{tag}
                      </Badge>
                    ))}
                    {blog.categories.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="outline" className="text-[10px]">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  asChild
                  aria-label={t('view')}
                  title={t('view')}
                >
                  <Link href={{ pathname: '/blog/[id]', params: { id: blog.id } }}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  asChild
                  aria-label={t('edit')}
                  title={t('edit')}
                >
                  <Link
                    href={{ pathname: '/blog/[id]/edit', params: { id: blog.id } }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant={blog.published ? 'secondary' : 'accent'}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => togglePublished(blog.id, blog.published)}
                >
                  {blog.published ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {blog.published ? t('unpublish') : t('publish')}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => deleteBlog(blog.id)}
                  aria-label={t('delete')}
                  title={t('delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
