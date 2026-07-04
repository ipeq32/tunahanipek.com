import { describe, expect, it } from 'vitest';
import { mapProjectToDto } from './project-mapper';

function buildProject() {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: 'p1',
    url: 'https://example.com',
    image: 'https://cdn.example.com/i.png',
    gallery: [],
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    translations: [
      {
        title: 'My project',
        description: '<p>Safe</p>',
        published: true,
        language: { code: 'en' },
      },
      {
        title: 'Projem',
        description: '<p>Güvenli</p>',
        published: true,
        language: { code: 'tr' },
      },
    ],
  };
}

describe('mapProjectToDto', () => {
  it('maps core fields through for requested locale', () => {
    const dto = mapProjectToDto(buildProject(), 'en');
    expect(dto.id).toBe('p1');
    expect(dto.title).toBe('My project');
    expect(dto.url).toBe('https://example.com');
    expect(dto.published).toBe(true);
    expect(dto.locale).toBe('en');
  });

  it('sanitizes the description', () => {
    const project = buildProject();
    project.translations[0].description =
      '<p>Hi</p><script>alert(1)</script>';

    const dto = mapProjectToDto(project, 'en');
    expect(dto.description).not.toContain('<script');
    expect(dto.description).toContain('Hi');
  });

  it('preserves nullable url and image', () => {
    const project = buildProject();
    Object.assign(project, { url: null, image: null });

    const dto = mapProjectToDto(project, 'en');
    expect(dto.url).toBeNull();
    expect(dto.image).toBeNull();
  });

  it('uses project-wide published state in admin mode', () => {
    const project = buildProject();
    project.translations[1].published = false;

    const dto = mapProjectToDto(project, 'en', {
      includeAllTranslations: true,
    });

    expect(dto.published).toBe(true);
  });

  it('marks project as draft when no translation is published in admin mode', () => {
    const project = buildProject();
    project.translations.forEach((translation) => {
      translation.published = false;
    });

    const dto = mapProjectToDto(project, 'en', {
      includeAllTranslations: true,
    });

    expect(dto.published).toBe(false);
  });
});
