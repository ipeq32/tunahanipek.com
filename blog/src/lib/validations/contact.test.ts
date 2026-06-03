import { describe, expect, it } from 'vitest';
import { contactSchema } from './contact';

const validPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello, I would like to get in touch about a project.',
};

describe('contactSchema', () => {
  it('accepts a valid payload', () => {
    expect(contactSchema.safeParse(validPayload).success).toBe(true);
  });

  it('trims and rejects a too short name', () => {
    expect(
      contactSchema.safeParse({ ...validPayload, name: ' a ' }).success,
    ).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(
      contactSchema.safeParse({ ...validPayload, email: 'not-an-email' })
        .success,
    ).toBe(false);
  });

  it('rejects a too short message', () => {
    expect(
      contactSchema.safeParse({ ...validPayload, message: 'short' }).success,
    ).toBe(false);
  });

  it('rejects an overly long message', () => {
    expect(
      contactSchema.safeParse({
        ...validPayload,
        message: 'x'.repeat(5001),
      }).success,
    ).toBe(false);
  });
});
