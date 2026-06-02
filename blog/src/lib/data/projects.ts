import { prisma } from '@/lib/prisma';
import { mapProjectToDto, type ProjectDto } from '@/lib/project-mapper';

export async function getPublishedProjects(): Promise<ProjectDto[]> {
  const projects = await prisma.project.findMany({
    where: { published: true, deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

  return projects.map(mapProjectToDto);
}

export async function getAdminProjects(): Promise<ProjectDto[]> {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

  return projects.map(mapProjectToDto);
}
