import { describe, expect, it } from 'vitest';

import { resolveDisplayErrorMessage } from '@/lib/ui-error';

describe('resolveDisplayErrorMessage', () => {
  it('replaces omitted production Server Component errors', () => {
    const raw =
      'An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.';

    expect(resolveDisplayErrorMessage(raw, 'Güvenli mesaj')).toBe(
      'Güvenli mesaj',
    );
  });

  it('keeps concrete development messages', () => {
    expect(
      resolveDisplayErrorMessage('PrismaClientKnownRequestError', 'fallback'),
    ).toBe('PrismaClientKnownRequestError');
  });

  it('uses fallback for empty messages', () => {
    expect(resolveDisplayErrorMessage('', 'fallback')).toBe('fallback');
    expect(resolveDisplayErrorMessage(undefined, 'fallback')).toBe('fallback');
  });
});
