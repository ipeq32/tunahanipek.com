'use client';

import { useCallback, useEffect, useState } from 'react';
import { IGetBlog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from '@/navigation';

export default function AdminBlogList() {
  const [blogs, setBlogs] = useState<IGetBlog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/admin`);
      if (!res.ok) throw new Error('Failed to load');
      const { data } = await res.json();
      setBlogs(data);
    } catch {
      toast.error('Blog listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

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
      toast.success(published ? 'Yazı yayından kaldırıldı' : 'Yazı yayınlandı');
      fetchBlogs();
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Yazı silindi');
      fetchBlogs();
    } catch {
      toast.error('Silme başarısız');
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Yükleniyor...</p>;
  }

  if (!blogs.length) {
    return <p className="text-sm">Henüz blog yazısı yok.</p>;
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
              {blog.published ? 'Yayında' : 'Taslak / onay bekliyor'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={{ pathname: '/blog/[id]', params: { id: blog.id } }}>
                Görüntüle
              </Link>
            </Button>
            <Button
              variant={blog.published ? 'secondary' : 'default'}
              size="sm"
              onClick={() => togglePublished(blog.id, blog.published)}
            >
              {blog.published ? 'Yayından kaldır' : 'Yayınla'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteBlog(blog.id)}
            >
              Sil
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
