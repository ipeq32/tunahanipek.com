import { describe, expect, it } from 'vitest';
import { prepareAiRichField } from './rich-content';

describe('prepareAiRichField', () => {
  it('converts project markdown into demoted safe html', () => {
    const markdown = `### Giriş
Kısa tanım.

### Teknoloji yığını
- NestJS
- PostgreSQL`;

    const html = prepareAiRichField(markdown, {
      contentType: 'project',
      field: 'description',
    });

    expect(html).toContain('<h3');
    expect(html).not.toContain('<h2');
    expect(html).toContain('NestJS');
    expect(html).not.toContain('<script');
  });

  it('keeps blog content headings when appropriate', () => {
    const markdown = `## Bölüm
Paragraf metni.`;

    const html = prepareAiRichField(markdown, {
      contentType: 'blog',
      field: 'content',
    });

    expect(html).toContain('<h2');
    expect(html).toContain('Paragraf metni');
  });

  it('sanitizes legacy ai html for projects', () => {
    const html = prepareAiRichField(
      '<h2>Giriş</h2><p>Tanım</p><script>alert(1)</script>',
      { contentType: 'project', field: 'description' },
    );

    expect(html).toContain('<h3');
    expect(html).not.toContain('<script');
  });

  it('demotes blog article h1 to h2', () => {
    const html = prepareAiRichField('<h1>Başlık</h1><p>Metin</p>', {
      contentType: 'blog',
      field: 'content',
    });

    expect(html).toContain('<h2');
    expect(html).not.toContain('<h1');
  });

  it('replaces non-breaking spaces that prevent line wrapping', () => {
    const html = prepareAiRichField(
      '<p>NestJS\u00a0ile\u00a0Restoran\u00a0API</p>',
      { contentType: 'project', field: 'description' },
    );

    expect(html).not.toContain('\u00a0');
    expect(html).toContain('NestJS ile Restoran API');
  });

  it('demotes blog summary headings for cards', () => {
    const html = prepareAiRichField('## Özet\nKısa metin.', {
      contentType: 'blog',
      field: 'summary',
    });

    expect(html).toContain('<h3');
    expect(html).not.toContain('<h2');
  });
});
