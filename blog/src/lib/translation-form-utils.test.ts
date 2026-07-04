import { describe, expect, it } from 'vitest';

import {
  canExpandBlogTranslation,
  canExpandProjectTranslation,
} from '@/lib/translation-form-utils';

describe('AI expand visibility', () => {
  it('shows project expand when only title is provided', () => {
    expect(
      canExpandProjectTranslation({ title: 'KSHUP', description: '' }, ''),
    ).toBe(true);
  });

  it('shows project expand when only description is provided', () => {
    expect(
      canExpandProjectTranslation(
        {
          title: '',
          description:
            '<p>KSHUP - minecraft sunucum için yapılmış site, topluluk alanı.</p>',
        },
        '',
      ),
    ).toBe(true);
  });

  it('shows project expand when title and long description are both provided', () => {
    expect(
      canExpandProjectTranslation(
        {
          title: 'KSHUP',
          description:
            '<p>KSHUP - minecraft sunucum için yapılmış site, topluluk alanı.</p>',
        },
        '',
      ),
    ).toBe(true);
  });

  it('shows project expand when only a valid project URL is provided', () => {
    expect(
      canExpandProjectTranslation(
        { title: '', description: '' },
        'https://www.kshup.com',
      ),
    ).toBe(true);
  });

  it('hides project expand when no seed fields are provided', () => {
    expect(canExpandProjectTranslation({ title: '', description: '' }, '')).toBe(
      false,
    );
    expect(
      canExpandProjectTranslation({ title: '', description: '' }, 'https://'),
    ).toBe(false);
  });

  it('shows blog expand when any blog seed field is provided', () => {
    expect(canExpandBlogTranslation({ title: 'Post', content: '', summary: '' })).toBe(
      true,
    );
    expect(
      canExpandBlogTranslation({ title: '', content: '', summary: 'Kısa not' }),
    ).toBe(true);
  });
});
