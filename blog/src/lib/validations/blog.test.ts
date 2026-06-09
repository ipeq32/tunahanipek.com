import { describe, expect, it } from 'vitest';
import { createBlogSchema, updateBlogSchema } from './blog';

const validPayload = {
  image: 'https://example.com/cover.png',
  shortImage: 'https://example.com/thumb.png',
  translations: [
    {
      languageCode: 'en',
      title: 'A valid blog title',
      content: '<p>Some content</p>',
      summary: 'A short summary',
    },
    {
      languageCode: 'tr',
      title: 'Geçerli bir blog başlığı',
      content: '<p>Biraz içerik</p>',
      summary: 'Kısa özet',
    },
  ],
};

describe('createBlogSchema', () => {
  it('accepts a complete valid payload', () => {
    const result = createBlogSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('accepts optional taxonomy fields', () => {
    const result = createBlogSchema.safeParse({
      ...validPayload,
      tags: 'nextjs, prisma',
      categories: 'Engineering',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing required field', () => {
    const withoutImage = { ...validPayload, image: undefined };
    expect(createBlogSchema.safeParse(withoutImage).success).toBe(false);
  });

  it('rejects a too short title', () => {
    expect(
      createBlogSchema.safeParse({
        ...validPayload,
        translations: [
          {
            languageCode: 'en',
            title: 'ab',
            content: '<p>Some content</p>',
            summary: 'A short summary',
          },
        ],
      }).success,
    ).toBe(false);
  });
});

describe('updateBlogSchema', () => {
  it('accepts a partial payload', () => {
    const result = updateBlogSchema.safeParse({
      translations: [{ languageCode: 'en', title: 'Updated title' }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts an empty payload', () => {
    expect(updateBlogSchema.safeParse({}).success).toBe(true);
  });

  it('rejects an invalid published type', () => {
    expect(
      updateBlogSchema.safeParse({ published: 'yes' }).success,
    ).toBe(false);
  });
});
