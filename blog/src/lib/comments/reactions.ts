import type { ReactionType } from '@prisma/client';
import type { CommentReactionSummary } from './types';

/** Tek bir tepki kaydının özet hesaplaması için ihtiyaç duyulan alanlar. */
export type ReactionInput = {
  type: ReactionType;
  userId: string;
};

/**
 * Bir yorumun tepki listesinden beğeni/beğenmeme sayılarını ve (verildiyse)
 * mevcut kullanıcının tepkisini hesaplar. Saf (yan etkisiz) bir fonksiyondur.
 */
export function summarizeReactions(
  reactions: ReactionInput[],
  viewerId?: string
): CommentReactionSummary {
  let likeCount = 0;
  let dislikeCount = 0;
  let myReaction: ReactionType | null = null;

  for (const reaction of reactions) {
    if (reaction.type === 'LIKE') likeCount += 1;
    else if (reaction.type === 'DISLIKE') dislikeCount += 1;

    if (viewerId && reaction.userId === viewerId) {
      myReaction = reaction.type;
    }
  }

  return { likeCount, dislikeCount, myReaction };
}

export type ReactionAction = 'create' | 'remove' | 'update';

/**
 * Toggle davranışının kararını verir:
 * - Mevcut tepki yoksa: oluştur.
 * - Aynı tepki tekrar geldiyse: kaldır (geri alma).
 * - Farklı tepki geldiyse: güncelle (like ↔ dislike).
 */
export function resolveReactionAction(
  existing: ReactionType | null,
  requested: ReactionType
): ReactionAction {
  if (!existing) return 'create';
  return existing === requested ? 'remove' : 'update';
}
