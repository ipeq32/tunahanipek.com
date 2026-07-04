import { describe, expect, it } from 'vitest';
import { reorderProjectsSchema } from '@/lib/validations/project';

describe('reorderProjectsSchema', () => {
  it('accepts a non-empty uuid list', () => {
    const result = reorderProjectsSchema.safeParse({
      orderedIds: ['550e8400-e29b-41d4-a716-446655440000'],
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid ids', () => {
    const result = reorderProjectsSchema.safeParse({
      orderedIds: ['not-a-uuid'],
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty lists', () => {
    const result = reorderProjectsSchema.safeParse({ orderedIds: [] });
    expect(result.success).toBe(false);
  });
});
