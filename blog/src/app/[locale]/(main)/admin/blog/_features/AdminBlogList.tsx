'use client';

import { useCallback, useEffect, useState } from 'react';
import { IGetBlog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import {
  AdminEmptyState,
  AdminListCard,
  AdminListSkeleton,
  AdminStatusBadge,
} from '@/components/admin/admin-ui';

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
    return <AdminListSkeleton rows={4} />;
  }

  if (!blogs.length) {
    return <AdminEmptyState message={t('empty')} />;
  }

  return (
    <div className="mt-6 space-y-3">
      {blogs.map((blog) => (
        <AdminListCard key={blog.id}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{blog.title}</p>
                <AdminStatusBadge
                  published={blog.published}
                  publishedLabel={t('statusPublished')}
                  draftLabel={t('statusDraft')}
                />
              </div>
              <p className="text-xs text-muted-foreground">{blog.author.name}</p>
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
                variant={blog.published ? 'secondary' : 'accent'}
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
        </AdminListCard>
      ))}
    </div>
  );
}
