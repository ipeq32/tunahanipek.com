import 'server-only';

import type { Role } from '@prisma/client';

import { PRIMARY_SUPER_ADMIN_EMAIL } from '@/lib/admin/users/primary-super-admin';
import { parseAddressDataJson } from '@/lib/address/types';
import { PUBLIC_SNAPSHOT_FORMAT_VERSION } from '@/lib/db-backup/constants';
import type {
  PublicSnapshot,
  PublicSnapshotBlog,
  PublicSnapshotProject,
} from '@/lib/public-snapshot/types';

type JoinCategory = { blogId: string; categoryId: string };
type JoinTag = { blogId: string; tagId: string };

type BackupTables = {
  Language?: Array<{
    id: string;
    code: string;
    name: string;
    isDefault: boolean;
    isActive: boolean;
    sortOrder: number;
  }>;
  Category?: Array<{
    id: string;
    name: string;
    deletedAt?: Date | string | null;
  }>;
  Tag?: Array<{
    id: string;
    name: string;
    deletedAt?: Date | string | null;
  }>;
  Blog?: Array<{
    id: string;
    image: string;
    shortImage: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletedAt?: Date | string | null;
    authorId?: string | null;
  }>;
  BlogTranslation?: Array<{
    blogId: string;
    languageId: string;
    title: string;
    content: string;
    summary: string;
    published: boolean;
  }>;
  _BlogToCategory?: JoinCategory[];
  _BlogToTag?: JoinTag[];
  Project?: Array<{
    id: string;
    url: string | null;
    image: string | null;
    gallery: string[];
    sortOrder: number;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletedAt?: Date | string | null;
  }>;
  ProjectTranslation?: Array<{
    projectId: string;
    languageId: string;
    title: string;
    description: string;
    published: boolean;
  }>;
  User?: Array<{
    id: string;
    email: string;
    contactEmail?: string | null;
    name: string;
    phone?: string | null;
    address?: string | null;
    addressData?: unknown;
    website?: string | null;
    image?: string | null;
    bio?: string | null;
    role: Role;
    deletedAt?: Date | string | null;
  }>;
  SiteResume?: Array<{ url: string; fileName: string }>;
  SiteSnippet?: Array<{
    type: string;
    locale: string;
    content: string;
    sortOrder: number;
    isActive: boolean;
  }>;
};

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function isDeleted(deletedAt?: Date | string | null): boolean {
  return deletedAt != null && deletedAt !== '';
}

/**
 * Full DB dump tablolarından secret’sız public snapshot üretir.
 * İkinci bir DB turu yapmaz (cron 60s bütçesi için).
 */
export function buildPublicSnapshotFromBackupTables(
  tables: BackupTables,
): PublicSnapshot {
  const languagesWithId = tables.Language ?? [];
  const languageById = new Map(
    languagesWithId.map((row) => [row.id, row.code]),
  );

  const categories = (tables.Category ?? [])
    .filter((row) => !isDeleted(row.deletedAt))
    .map((row) => ({ id: row.id, name: row.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const tags = (tables.Tag ?? [])
    .filter((row) => !isDeleted(row.deletedAt))
    .map((row) => ({ id: row.id, name: row.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const tagNameById = new Map(tags.map((t) => [t.id, t.name]));

  const usersById = new Map(
    (tables.User ?? [])
      .filter((u) => !isDeleted(u.deletedAt))
      .map((u) => [u.id, u]),
  );

  const blogCategoryIds = new Map<string, string[]>();
  for (const join of tables._BlogToCategory ?? []) {
    const list = blogCategoryIds.get(join.blogId) ?? [];
    list.push(join.categoryId);
    blogCategoryIds.set(join.blogId, list);
  }

  const blogTagIds = new Map<string, string[]>();
  for (const join of tables._BlogToTag ?? []) {
    const list = blogTagIds.get(join.blogId) ?? [];
    list.push(join.tagId);
    blogTagIds.set(join.blogId, list);
  }

  const translationsByBlog = new Map<
    string,
    PublicSnapshotBlog['translations']
  >();
  for (const row of tables.BlogTranslation ?? []) {
    if (!row.published) continue;
    const code = languageById.get(row.languageId);
    if (!code) continue;
    const list = translationsByBlog.get(row.blogId) ?? [];
    list.push({
      title: row.title,
      content: row.content,
      summary: row.summary,
      published: true,
      language: { code },
    });
    translationsByBlog.set(row.blogId, list);
  }

  const blogs: PublicSnapshotBlog[] = (tables.Blog ?? [])
    .filter((blog) => !isDeleted(blog.deletedAt))
    .map((blog) => {
      const translations = translationsByBlog.get(blog.id) ?? [];
      if (translations.length === 0) return null;

      const authorUser = blog.authorId ? usersById.get(blog.authorId) : null;

      return {
        id: blog.id,
        image: blog.image,
        shortImage: blog.shortImage,
        createdAt: toIso(blog.createdAt),
        updatedAt: toIso(blog.updatedAt),
        author: authorUser
          ? {
              name: authorUser.name,
              image: authorUser.image ?? null,
              role: authorUser.role,
            }
          : null,
        tags: (blogTagIds.get(blog.id) ?? [])
          .map((id) => tagNameById.get(id))
          .filter((name): name is string => Boolean(name))
          .map((name) => ({ name })),
        categories: (blogCategoryIds.get(blog.id) ?? [])
          .map((id) => categoryNameById.get(id))
          .filter((name): name is string => Boolean(name))
          .map((name) => ({ name })),
        translations,
      } satisfies PublicSnapshotBlog;
    })
    .filter((blog): blog is PublicSnapshotBlog => blog != null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const translationsByProject = new Map<
    string,
    PublicSnapshotProject['translations']
  >();
  for (const row of tables.ProjectTranslation ?? []) {
    if (!row.published) continue;
    const code = languageById.get(row.languageId);
    if (!code) continue;
    const list = translationsByProject.get(row.projectId) ?? [];
    list.push({
      title: row.title,
      description: row.description,
      published: true,
      language: { code },
    });
    translationsByProject.set(row.projectId, list);
  }

  const projects: PublicSnapshotProject[] = (tables.Project ?? [])
    .filter((project) => !isDeleted(project.deletedAt))
    .map((project) => {
      const translations = translationsByProject.get(project.id) ?? [];
      if (translations.length === 0) return null;
      return {
        id: project.id,
        url: project.url,
        image: project.image,
        gallery: project.gallery ?? [],
        sortOrder: project.sortOrder,
        createdAt: toIso(project.createdAt),
        updatedAt: toIso(project.updatedAt),
        translations,
      } satisfies PublicSnapshotProject;
    })
    .filter((project): project is PublicSnapshotProject => project != null)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  const ownerUser =
    (tables.User ?? []).find(
      (user) =>
        !isDeleted(user.deletedAt) &&
        user.email.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase(),
    ) ?? null;

  const resume = (tables.SiteResume ?? [])[0] ?? null;

  return {
    version: PUBLIC_SNAPSHOT_FORMAT_VERSION,
    createdAt: new Date().toISOString(),
    languages: languagesWithId
      .filter((row) => row.isActive)
      .map((row) => ({
        code: row.code,
        name: row.name,
        isDefault: row.isDefault,
        isActive: row.isActive,
        sortOrder: row.sortOrder,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    categories,
    tags,
    blogs,
    projects,
    siteOwner: ownerUser
      ? {
          name: ownerUser.name,
          email: ownerUser.email,
          contactEmail: ownerUser.contactEmail ?? null,
          phone: ownerUser.phone ?? null,
          address: ownerUser.address ?? null,
          addressData: parseAddressDataJson(ownerUser.addressData),
          website: ownerUser.website ?? null,
          image: ownerUser.image ?? null,
          bio: ownerUser.bio ?? null,
        }
      : null,
    siteResume: resume
      ? { url: resume.url, fileName: resume.fileName }
      : null,
    siteSnippets: (tables.SiteSnippet ?? [])
      .filter((row) => row.isActive)
      .map((row) => ({
        type: row.type,
        locale: row.locale,
        content: row.content,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
      })),
  };
}

export function serializePublicSnapshot(snapshot: PublicSnapshot): string {
  return JSON.stringify(snapshot);
}
