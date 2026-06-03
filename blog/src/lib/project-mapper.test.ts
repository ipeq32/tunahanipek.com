import { describe, expect, it } from 'vitest';
import { mapProjectToDto } from './project-mapper';
import type { Project } from '@prisma/client';

function buildProject(overrides: Partial<Project> = {}): Project {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: 'p1',
    title: 'My project',
    description: '<p>Safe</p>',
    url: 'https://example.com',
    image: 'https://cdn.example.com/i.png',
    sortOrder: 0,
    published: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

describe('mapProjectToDto', () => {
  it('maps core fields through', () => {
    const dto = mapProjectToDto(buildProject());
    expect(dto.id).toBe('p1');
    expect(dto.title).toBe('My project');
    expect(dto.url).toBe('https://example.com');
    expect(dto.published).toBe(true);
  });

  it('sanitizes the description', () => {
    const dto = mapProjectToDto(
      buildProject({ description: '<p>Hi</p><script>alert(1)</script>' })
    );
    expect(dto.description).not.toContain('<script');
    expect(dto.description).toContain('Hi');
  });

  it('preserves nullable url and image', () => {
    const dto = mapProjectToDto(buildProject({ url: null, image: null }));
    expect(dto.url).toBeNull();
    expect(dto.image).toBeNull();
  });
});
