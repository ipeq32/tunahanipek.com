import type { ReactionType, Status } from '@prisma/client';

export type CommentReactionSummary = {
  likeCount: number;
  dislikeCount: number;
  /** Mevcut kullanıcının bu yoruma bıraktığı tepki; yoksa veya anonimse null. */
  myReaction: ReactionType | null;
};

export type CommentViewDto = {
  id: string;
  content: string;
  authorName: string;
  createdAtLabel: string;
  replies: CommentViewDto[];
} & CommentReactionSummary;

export type CommentDto = {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string;
  status: Status;
  replies: CommentDto[];
} & CommentReactionSummary;

export type PendingCommentDto = {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  blog: { id: string; title: string } | null;
};
