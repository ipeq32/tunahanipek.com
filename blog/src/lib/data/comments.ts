import 'server-only';

import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';
import { formatCommentDate } from '@/lib/comments/format-date';
import {
  resolveReactionAction,
  summarizeReactions,
} from '@/lib/comments/reactions';
import type {
  CommentDto,
  CommentReactionSummary,
  CommentViewDto,
  PendingCommentDto,
} from '@/lib/comments/types';
import type { ReactionType, Status } from '@prisma/client';

export type {
  CommentDto,
  CommentReactionSummary,
  CommentViewDto,
  PendingCommentDto,
} from '@/lib/comments/types';
export { formatCommentDate } from '@/lib/comments/format-date';

type RawReaction = { type: ReactionType; userId: string };

type RawComment = {
  id: string;
  content: string;
  createdAt: Date;
  status: Status;
  user: { name: string } | null;
  reactions?: RawReaction[];
  replies?: RawComment[];
};

const reactionInclude = {
  select: { type: true, userId: true },
} as const;

function mapCommentToView(
  comment: CommentDto,
  locale: string
): CommentViewDto {
  return {
    id: comment.id,
    content: comment.content,
    authorName: comment.authorName,
    createdAtLabel: formatCommentDate(comment.createdAt, locale),
    likeCount: comment.likeCount,
    dislikeCount: comment.dislikeCount,
    myReaction: comment.myReaction,
    replies: comment.replies.map((reply) => mapCommentToView(reply, locale)),
  };
}

function mapComment(comment: RawComment, viewerId?: string): CommentDto {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    status: comment.status,
    authorName: comment.user?.name ?? 'Anonim',
    ...summarizeReactions(comment.reactions ?? [], viewerId),
    replies: (comment.replies ?? []).map((reply) =>
      mapComment(reply, viewerId)
    ),
  };
}

export async function getApprovedComments(
  blogId: string,
  viewerId?: string
): Promise<CommentDto[]> {
  const comments = await prisma.comment.findMany({
    where: {
      blogId,
      deletedAt: null,
      status: 'APPROVED',
      commentId: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      reactions: reactionInclude,
      // Yalnızca onaylı yanıtları, kronolojik (eskiden yeniye) sırada getiririz.
      replies: {
        where: { deletedAt: null, status: 'APPROVED' },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { name: true } },
          reactions: reactionInclude,
        },
      },
    },
  });

  return comments.map((comment) => mapComment(comment, viewerId));
}

export async function getApprovedCommentViews(
  blogId: string,
  locale: string,
  viewerId?: string
): Promise<CommentViewDto[]> {
  const comments = await getApprovedComments(blogId, viewerId);

  return comments.map((comment) => mapCommentToView(comment, locale));
}

export async function getPendingCommentsDto(): Promise<PendingCommentDto[]> {
  const comments = await getPendingComments();

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    user: comment.user,
    blog: comment.blog,
  }));
}

export async function getPendingComments() {
  return prisma.comment.findMany({
    where: { deletedAt: null, status: 'PENDING', commentId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      blog: { select: { id: true, title: true } },
    },
  });
}

export async function createComment(
  blogId: string,
  userId: string,
  content: string,
  parentId?: string
) {
  const comment = await prisma.comment.create({
    data: {
      content: sanitizeHtml(content),
      blogId,
      userId,
      status: 'PENDING',
      ...(parentId ? { commentId: parentId, isReply: true } : {}),
    },
    include: { user: { select: { name: true } } },
  });

  return mapComment(comment);
}

/**
 * Bir yanıtın bağlanacağı üst yorumun, aynı bloğa ait, onaylı ve üst seviye
 * (kendisi bir yanıt değil) olduğunu doğrular. Tek seviye yanıtlama (flat
 * thread) modelini korumak için yanıta yanıt verilmesini engeller.
 */
export async function isValidReplyParent(
  parentId: string,
  blogId: string
): Promise<boolean> {
  const parent = await prisma.comment.findFirst({
    where: {
      id: parentId,
      blogId,
      deletedAt: null,
      status: 'APPROVED',
      commentId: null,
    },
    select: { id: true },
  });

  return parent !== null;
}

export async function updateCommentStatus(id: string, status: Status) {
  return prisma.comment.update({
    where: { id },
    data: { status },
  });
}

/**
 * Kullanıcının bir yoruma verdiği tepkiyi toggle eder:
 * - Tepki yoksa eklenir.
 * - Aynı tepki tekrar gelirse kaldırılır (geri alma).
 * - Farklı tepki gelirse türü güncellenir (like ↔ dislike).
 *
 * Yalnızca onaylı ve silinmemiş yorumlara tepki verilebilir. Yorum uygun
 * değilse `null` döner; aksi halde güncel tepki özeti döner.
 */
export async function toggleCommentReaction(
  commentId: string,
  userId: string,
  type: ReactionType
): Promise<CommentReactionSummary | null> {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, deletedAt: null, status: 'APPROVED' },
    select: { id: true },
  });

  if (!comment) return null;

  const existing = await prisma.commentReaction.findUnique({
    where: { commentId_userId: { commentId, userId } },
    select: { id: true, type: true },
  });

  const action = resolveReactionAction(existing?.type ?? null, type);

  if (action === 'create') {
    await prisma.commentReaction.create({ data: { commentId, userId, type } });
  } else if (action === 'remove') {
    await prisma.commentReaction.delete({ where: { id: existing!.id } });
  } else {
    await prisma.commentReaction.update({
      where: { id: existing!.id },
      data: { type },
    });
  }

  const reactions = await prisma.commentReaction.findMany({
    where: { commentId },
    select: { type: true, userId: true },
  });

  return summarizeReactions(reactions, userId);
}
