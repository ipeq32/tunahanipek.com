import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';
import { Status } from '@prisma/client';

export type CommentDto = {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string;
  status: Status;
};

export type CommentViewDto = {
  id: string;
  content: string;
  authorName: string;
  createdAtLabel: string;
};

const COMMENT_DATE_TIME_ZONE = 'Europe/Istanbul';

export function formatCommentDate(date: Date | string, locale: string): string {
  const value = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: COMMENT_DATE_TIME_ZONE,
  }).format(value);
}

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

export type PendingCommentDto = {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  blog: { id: string; title: string } | null;
};

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
