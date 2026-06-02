'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import type { CommentDto } from '@/lib/data/comments';

type Props = {
  blogId: string;
  initialComments: CommentDto[];
};

export default function BlogComments({ blogId, initialComments }: Props) {
  const t = useTranslations('Comments');
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${blogId}/comments`
    );
    if (res.ok) {
      const { data } = await res.json();
      setComments(data);
    }
  }, [blogId]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const onSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${blogId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }
      );
      if (!res.ok) throw new Error('Failed');
      setContent('');
      toast.success(t('pendingApproval'));
      await refresh();
    } catch {
      toast.error(t('submitError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-16 rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
      <h2 className="mb-6 text-xl font-semibold tracking-tight">{t('title')}</h2>
      <ul className="mb-6 space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        )}
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-border/60 bg-background/60 p-4"
          >
            <p className="text-sm">{c.content}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {c.authorName} · {new Date(c.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
      {session?.user ? (
        <div className="space-y-3 max-w-xl">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('placeholder')}
            rows={3}
          />
          <Button variant="accent" onClick={onSubmit} disabled={loading}>
            {t('submit')}
          </Button>
        </div>
      ) : (
        <p className="text-sm">
          <Link href="/auth/login" className="text-teal-600 hover:underline">
            {t('loginToComment')}
          </Link>
        </p>
      )}
    </section>
  );
}
