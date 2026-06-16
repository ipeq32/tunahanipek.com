'use client';

import { useCallback, useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DataPagination } from '@/components/ui/data-pagination';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import type { CommentViewDto } from '@/lib/comments/types';
import type { Locale } from '@/i18n/request';
import { type PageSize, type PaginationMeta } from '@/lib/pagination';

type ReactionKind = 'LIKE' | 'DISLIKE';

type Props = {
  blogId: string;
  locale: Locale;
  isAuthenticated: boolean;
  initialComments: CommentViewDto[];
  initialPagination: PaginationMeta;
};

type ReactionSummary = {
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionKind | null;
};

const ROOT_FORM = 'root';

/** Ağaçtaki tek bir yorumu (yanıtlar dahil) id'sine göre günceller. */
function patchComment(
  comments: CommentViewDto[],
  id: string,
  patch: Partial<CommentViewDto>
): CommentViewDto[] {
  return comments.map((comment) => {
    if (comment.id === id) {
      return { ...comment, ...patch };
    }
    if (comment.replies.length > 0) {
      return { ...comment, replies: patchComment(comment.replies, id, patch) };
    }
    return comment;
  });
}

export default function BlogComments({
  blogId,
  locale,
  isAuthenticated,
  initialComments,
  initialPagination,
}: Props) {
  const t = useTranslations('Comments');
  const [comments, setComments] = useState(initialComments);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(initialPagination.page);
  const [limit, setLimit] = useState<PageSize>(initialPagination.limit);
  const [content, setContent] = useState('');
  // Aktif gönderim hedefi: kök form için ROOT_FORM, yanıtlar için yorum id'si.
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const loadComments = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const res = await fetch(`/api/blog/${blogId}/comments?${params.toString()}`);
    if (res.ok) {
      const body = await res.json();
      setComments(body.data);
      setPagination(body.pagination);
    }
  }, [blogId, limit, page]);

  const refresh = useCallback(async () => {
    await loadComments();
  }, [loadComments]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    setComments(initialComments);
    setPagination(initialPagination);
  }, [initialComments, initialPagination]);

  const submitComment = useCallback(
    async (text: string, parentId?: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setSubmittingFor(parentId ?? ROOT_FORM);
      try {
        const res = await fetch(
          `/api/blog/${blogId}/comments`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: trimmed, parentId }),
          }
        );
        if (!res.ok) throw new Error('Failed');

        if (parentId) {
          setReplyContent('');
          setReplyingTo(null);
        } else {
          setContent('');
        }
        toast.success(t('pendingApproval'));
        await refresh();
      } catch {
        toast.error(t('submitError'));
      } finally {
        setSubmittingFor(null);
      }
    },
    [blogId, refresh, t]
  );

  const react = useCallback(
    async (commentId: string, type: ReactionKind) => {
      if (!isAuthenticated) {
        toast.error(t('loginToReact'));
        return;
      }
      try {
        const res = await fetch(
          `/api/comments/${commentId}/reaction`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type }),
          }
        );
        if (!res.ok) throw new Error('Failed');
        const { data } = (await res.json()) as { data: ReactionSummary };
        setComments((prev) => patchComment(prev, commentId, data));
      } catch {
        toast.error(t('reactError'));
      }
    },
    [isAuthenticated, t]
  );

  return (
    <section className="mt-16 rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
      <h2 className="mb-6 text-xl font-semibold tracking-tight">{t('title')}</h2>

      <ul className="mb-6 space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        )}
        {comments.map((comment) => (
          <li key={comment.id}>
            <CommentItem
              comment={comment}
              isAuthenticated={isAuthenticated}
              isReplyOpen={replyingTo === comment.id}
              replyContent={replyContent}
              isSubmitting={submittingFor === comment.id}
              onToggleReply={() => {
                setReplyingTo((prev) =>
                  prev === comment.id ? null : comment.id
                );
                setReplyContent('');
              }}
              onReplyChange={setReplyContent}
              onReplySubmit={() => submitComment(replyContent, comment.id)}
              onReact={react}
              labels={{
                reply: t('reply'),
                cancel: t('cancel'),
                send: t('replySubmit'),
                placeholder: t('replyPlaceholder'),
                like: t('like'),
                dislike: t('dislike'),
              }}
            />
          </li>
        ))}
      </ul>

      {isAuthenticated ? (
        <div className="max-w-xl space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('placeholder')}
            rows={3}
          />
          <Button
            variant="accent"
            onClick={() => submitComment(content)}
            disabled={submittingFor === ROOT_FORM}
          >
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

      <DataPagination
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </section>
  );
}

type CommentLabels = {
  reply: string;
  cancel: string;
  send: string;
  placeholder: string;
  like: string;
  dislike: string;
};

type CommentItemProps = {
  comment: CommentViewDto;
  isAuthenticated: boolean;
  isReplyOpen: boolean;
  replyContent: string;
  isSubmitting: boolean;
  onToggleReply: () => void;
  onReplyChange: (value: string) => void;
  onReplySubmit: () => void;
  onReact: (commentId: string, type: ReactionKind) => void;
  labels: CommentLabels;
};

function CommentItem({
  comment,
  isAuthenticated,
  isReplyOpen,
  replyContent,
  isSubmitting,
  onToggleReply,
  onReplyChange,
  onReplySubmit,
  onReact,
  labels,
}: CommentItemProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
      <p className="text-sm">{comment.content}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <p className="text-xs text-muted-foreground">
          {comment.authorName} · {comment.createdAtLabel}
        </p>
        <ReactionBar comment={comment} onReact={onReact} labels={labels} />
        {isAuthenticated && (
          <button
            type="button"
            onClick={onToggleReply}
            className="text-xs font-medium text-teal-600 hover:underline"
          >
            {isReplyOpen ? labels.cancel : labels.reply}
          </button>
        )}
      </div>

      {isReplyOpen && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder={labels.placeholder}
            rows={2}
          />
          <Button
            size="sm"
            variant="accent"
            onClick={onReplySubmit}
            disabled={isSubmitting}
          >
            {labels.send}
          </Button>
        </div>
      )}

      {comment.replies.length > 0 && (
        <ul className="mt-3 space-y-3 border-l border-border/60 pl-4">
          {comment.replies.map((reply) => (
            <li
              key={reply.id}
              className="rounded-lg border border-border/40 bg-background/40 p-3"
            >
              <p className="text-sm">{reply.content}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  {reply.authorName} · {reply.createdAtLabel}
                </p>
                <ReactionBar
                  comment={reply}
                  onReact={onReact}
                  labels={labels}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type ReactionBarProps = {
  comment: CommentViewDto;
  onReact: (commentId: string, type: ReactionKind) => void;
  labels: Pick<CommentLabels, 'like' | 'dislike'>;
};

function ReactionBar({ comment, onReact, labels }: ReactionBarProps) {
  return (
    <div className="flex items-center gap-2">
      <ReactionButton
        active={comment.myReaction === 'LIKE'}
        count={comment.likeCount}
        label={labels.like}
        onClick={() => onReact(comment.id, 'LIKE')}
        icon={<ThumbsUp className="h-3.5 w-3.5" />}
        activeClassName="text-teal-600"
      />
      <ReactionButton
        active={comment.myReaction === 'DISLIKE'}
        count={comment.dislikeCount}
        label={labels.dislike}
        onClick={() => onReact(comment.id, 'DISLIKE')}
        icon={<ThumbsDown className="h-3.5 w-3.5" />}
        activeClassName="text-red-500"
      />
    </div>
  );
}

type ReactionButtonProps = {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  activeClassName: string;
};

function ReactionButton({
  active,
  count,
  label,
  onClick,
  icon,
  activeClassName,
}: ReactionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground',
        active && activeClassName
      )}
    >
      {icon}
      <span>{count}</span>
    </button>
  );
}
