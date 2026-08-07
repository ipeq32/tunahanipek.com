import { mapBlogToResponse } from '@/lib/blog-mapper';
import { mapProjectToDto, type ProjectDto } from '@/lib/project-mapper';
import {
  buildPaginatedResult,
  type PageSize,
  type PaginatedResult,
} from '@/lib/pagination';
import type { PublicSnapshot } from '@/lib/public-snapshot/types';
import type { SiteOwnerProfile } from '@/lib/site-owner';
import {
  buildMapsHref,
  formatAddressShort,
  resolvePublicEmail,
} from '@/lib/contact/display';
import { formatAddressLine } from '@/lib/address/format';
import { getPublishedTranslationLocaleCodes } from '@/lib/published-translation-query';
import { IGetBlog } from '@/types/blog';

function reviveBlog(blog: PublicSnapshot['blogs'][number]) {
  return {
    ...blog,
    createdAt: new Date(blog.createdAt),
    updatedAt: new Date(blog.updatedAt),
  };
}

function reviveProject(project: PublicSnapshot['projects'][number]) {
  return {
    ...project,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  };
}

function blogMatchesFilters(
  blog: PublicSnapshot['blogs'][number],
  locale: string,
  filters: { search?: string; tag?: string; category?: string },
): boolean {
  const localeCodes = new Set(getPublishedTranslationLocaleCodes(locale));
  const published = blog.translations.filter(
    (t) => t.published && localeCodes.has(t.language.code),
  );
  if (published.length === 0) return false;

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = published
      .map((t) => `${t.title} ${t.summary} ${t.content}`)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  const tag = filters.tag?.trim().toLowerCase();
  if (tag && !blog.tags.some((t) => t.name.toLowerCase() === tag)) {
    return false;
  }

  const category = filters.category?.trim();
  if (category && !blog.categories.some((c) => c.name === category)) {
    return false;
  }

  return true;
}

export function queryPublishedBlogsFromSnapshot(
  snapshot: PublicSnapshot,
  page: number,
  limit: number,
  filters: {
    search?: string;
    tag?: string;
    category?: string;
    locale?: string;
  } = {},
): { data: IGetBlog[]; total: number; page: number; limit: number } {
  const locale = filters.locale ?? 'tr';
  const filtered = snapshot.blogs.filter((blog) =>
    blogMatchesFilters(blog, locale, filters),
  );
  const total = filtered.length;
  const offset = (page - 1) * limit;
  const slice = filtered.slice(offset, offset + limit);

  return {
    data: slice.map((blog) => mapBlogToResponse(reviveBlog(blog), locale)),
    total,
    page,
    limit,
  };
}

export function queryPublishedBlogByIdFromSnapshot(
  snapshot: PublicSnapshot,
  id: string,
  locale: string,
): IGetBlog | null {
  const blog = snapshot.blogs.find((row) => row.id === id);
  if (!blog) return null;
  return mapBlogToResponse(reviveBlog(blog), locale);
}

export function queryPublishedProjectsFromSnapshot(
  snapshot: PublicSnapshot,
  locale: string,
): ProjectDto[] {
  return snapshot.projects.map((project) =>
    mapProjectToDto(reviveProject(project), locale),
  );
}

export function queryPublishedProjectsPaginatedFromSnapshot(
  snapshot: PublicSnapshot,
  locale: string,
  page: number,
  limit: PageSize,
): PaginatedResult<ProjectDto> {
  const all = queryPublishedProjectsFromSnapshot(snapshot, locale);
  const offset = (page - 1) * limit;
  return buildPaginatedResult(
    all.slice(offset, offset + limit),
    page,
    limit,
    all.length,
  );
}

export function queryPublishedProjectByIdFromSnapshot(
  snapshot: PublicSnapshot,
  id: string,
  locale: string,
): ProjectDto | null {
  const project = snapshot.projects.find((row) => row.id === id);
  if (!project) return null;
  return mapProjectToDto(reviveProject(project), locale);
}

export function queryCategoriesFromSnapshot(snapshot: PublicSnapshot) {
  return snapshot.categories;
}

export function queryTagsFromSnapshot(snapshot: PublicSnapshot) {
  return snapshot.tags;
}

export function querySiteOwnerFromSnapshot(
  snapshot: PublicSnapshot,
): SiteOwnerProfile | null {
  const owner = snapshot.siteOwner;
  if (!owner) return null;

  const address =
    owner.address?.trim() ||
    (owner.addressData ? formatAddressLine(owner.addressData) : null);

  return {
    name: owner.name,
    email: owner.email,
    contactEmail: owner.contactEmail,
    publicEmail: resolvePublicEmail(owner.contactEmail, owner.email),
    phone: owner.phone,
    address,
    addressData: owner.addressData,
    addressShort: formatAddressShort(owner.addressData, address),
    mapsHref: buildMapsHref(owner.addressData, address),
    website: owner.website,
    image: owner.image,
    bio: owner.bio,
  };
}
