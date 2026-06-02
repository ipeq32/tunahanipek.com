import type { Project } from '@prisma/client';

export type ProjectDto = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  image: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function mapProjectToDto(project: Project): ProjectDto {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    url: project.url,
    image: project.image,
    sortOrder: project.sortOrder,
    published: project.published,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}
