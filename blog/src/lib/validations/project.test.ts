import { describe, expect, it } from 'vitest';
import { createProjectSchema, updateProjectSchema } from './project';

describe('project url validation', () => {
  it('accepts empty url on update', () => {
    const result = updateProjectSchema.safeParse({
      url: '',
      image: null,
      translations: [],
    });

    expect(result.success).toBe(true);
  });

  it('accepts null url on update', () => {
    const result = updateProjectSchema.safeParse({
      url: null,
      image: null,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid url on update', () => {
    const result = updateProjectSchema.safeParse({
      url: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid url on create', () => {
    const result = createProjectSchema.safeParse({
      url: 'https://example.com',
      image: '',
      translations: [
        {
          languageCode: 'tr',
          title: 'Test',
          description: '<p>Desc</p>',
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
