import type { Status } from '@prisma/client';

export type CommentViewDto = {
  id: string;
  content: string;
  authorName: string;
  createdAtLabel: string;
};

export type CommentDto = {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string;
  status: Status;
};

export type PendingCommentDto = {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  blog: { id: string; title: string } | null;
};
