import { describe, expect, it } from 'vitest';
import {
  resolveReactionAction,
  summarizeReactions,
  type ReactionInput,
} from './reactions';

describe('summarizeReactions', () => {
  const reactions: ReactionInput[] = [
    { type: 'LIKE', userId: 'a' },
    { type: 'LIKE', userId: 'b' },
    { type: 'DISLIKE', userId: 'c' },
  ];

  it('counts likes and dislikes', () => {
    const summary = summarizeReactions(reactions);
    expect(summary.likeCount).toBe(2);
    expect(summary.dislikeCount).toBe(1);
  });

  it('returns null reaction when viewer is anonymous', () => {
    expect(summarizeReactions(reactions).myReaction).toBeNull();
  });

  it('returns null reaction when viewer has not reacted', () => {
    expect(summarizeReactions(reactions, 'z').myReaction).toBeNull();
  });

  it("resolves the viewer's own reaction", () => {
    expect(summarizeReactions(reactions, 'a').myReaction).toBe('LIKE');
    expect(summarizeReactions(reactions, 'c').myReaction).toBe('DISLIKE');
  });

  it('handles an empty list', () => {
    expect(summarizeReactions([])).toEqual({
      likeCount: 0,
      dislikeCount: 0,
      myReaction: null,
    });
  });
});

describe('resolveReactionAction', () => {
  it('creates when there is no existing reaction', () => {
    expect(resolveReactionAction(null, 'LIKE')).toBe('create');
  });

  it('removes when the same reaction is repeated', () => {
    expect(resolveReactionAction('LIKE', 'LIKE')).toBe('remove');
    expect(resolveReactionAction('DISLIKE', 'DISLIKE')).toBe('remove');
  });

  it('updates when switching reaction type', () => {
    expect(resolveReactionAction('LIKE', 'DISLIKE')).toBe('update');
    expect(resolveReactionAction('DISLIKE', 'LIKE')).toBe('update');
  });
});
