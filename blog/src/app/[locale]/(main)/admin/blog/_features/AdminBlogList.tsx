'use client';

import { useCallback, useEffect, useState } from 'react';
import { IGetBlog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function AdminBlogList() {
  const t = useTranslations('Admin.Blog');
  const [blogs, setBlogs] = useState<IGetBlog[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

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

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  if (!blogs.length) {
    return <p className="text-sm">{t('empty')}</p>;
  }

  return (
    <div className="space-y-4 mt-6">
      {blogs.map((blog) => (
        <div
          key={blog.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg dark:border-slate-700"
        >
          <div>
            <p className="font-medium">{blog.title}</p>
            <p className="text-xs text-muted-foreground">
              {blog.author.name} ·{' '}
              {blog.published ? t('statusPublished') : t('statusDraft')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={{ pathname: '/blog/[id]', params: { id: blog.id } }}>
                {t('view')}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={{ pathname: '/blog/[id]/edit', params: { id: blog.id } }}
              >
                {t('edit')}
              </Link>
            </Button>
            <Button
              variant={blog.published ? 'secondary' : 'default'}
              size="sm"
              onClick={() => togglePublished(blog.id, blog.published)}
            >
              {blog.published ? t('unpublish') : t('publish')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteBlog(blog.id)}
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
