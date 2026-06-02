'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

type PendingComment = {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  blog: { id: string; title: string } | null;
};

export default function AdminCommentsList() {
  const t = useTranslations('Admin.Comments');
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/comments`
      );
      if (!res.ok) throw new Error('Failed');
      const { data } = await res.json();
      setComments(data);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const moderate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/comments`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        }
      );
      if (!res.ok) throw new Error('Failed');
      toast.success(status === 'APPROVED' ? t('approved') : t('rejected'));
      fetchComments();
    } catch {
      toast.error(t('actionError'));
    }
  };

  if (loading) return <p className="text-sm">{t('loading')}</p>;
  if (!comments.length) return <p className="text-sm">{t('empty')}</p>;

  return (
    <div className="space-y-4 mt-6">
      {comments.map((c) => (
        <div
          key={c.id}
          className="p-4 border rounded-lg dark:border-slate-700 space-y-2"
        >
          <p className="text-sm">{c.content}</p>
          <p className="text-xs text-muted-foreground">
            {c.user?.name} ({c.user?.email}) ·{' '}
            {c.blog && (
              <Link
                href={{ pathname: '/blog/[id]', params: { id: c.blog.id } }}
                className="text-teal-600 hover:underline"
              >
                {c.blog.title}
              </Link>
            )}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => moderate(c.id, 'APPROVED')}>
              {t('approve')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => moderate(c.id, 'REJECTED')}
            >
              {t('reject')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
