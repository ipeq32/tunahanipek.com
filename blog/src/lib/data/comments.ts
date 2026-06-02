import 'server-only';

import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';
import { formatCommentDate } from '@/lib/comments/format-date';
import type {
  CommentDto,
  CommentViewDto,
  PendingCommentDto,
} from '@/lib/comments/types';
import type { Status } from '@prisma/client';

export type { CommentDto, CommentViewDto, PendingCommentDto } from '@/lib/comments/types';
export { formatCommentDate } from '@/lib/comments/format-date';

function mapCommentToView(
  comment: CommentDto,
  locale: string
): CommentViewDto {
  return {
    id: comment.id,
    content: comment.content,
    authorName: comment.authorName,
    createdAtLabel: formatCommentDate(comment.createdAt, locale),
  };
}

function mapComment(comment: {
  id: string;
  content: string;
  createdAt: Date;
  status: Status;
  user: { name: string } | null;
}): CommentDto {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    status: comment.status,
    authorName: comment.user?.name ?? 'Anonim',
  };
}

export async function getApprovedComments(blogId: string): Promise<CommentDto[]> {
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
    },
  });

  return comments.map(mapComment);
}

export async function getApprovedCommentViews(
  blogId: string,
  locale: string
): Promise<CommentViewDto[]> {
  const comments = await getApprovedComments(blogId);

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
  content: string
) {
  const comment = await prisma.comment.create({
    data: {
      content: sanitizeHtml(content),
      blogId,
      userId,
      status: 'PENDING',
    },
    include: { user: { select: { name: true } } },
  });

  return mapComment(comment);
}

export async function updateCommentStatus(id: string, status: Status) {
  return prisma.comment.update({
    where: { id },
    data: { status },
  });
}
