import type { Role } from '@prisma/client';

import type { AddressData } from '@/lib/address/types';
import { PUBLIC_SNAPSHOT_FORMAT_VERSION } from '@/lib/db-backup/constants';

export type PublicSnapshotLanguage = {
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type PublicSnapshotTaxonomy = {
  id: string;
  name: string;
};

export type PublicSnapshotBlogTranslation = {
  title: string;
  content: string;
  summary: string;
  published: boolean;
  language: { code: string };
};

export type PublicSnapshotBlog = {
  id: string;
  image: string;
  shortImage: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    image: string | null;
    role: Role;
  } | null;
  tags: { name: string }[];
  categories: { name: string }[];
  translations: PublicSnapshotBlogTranslation[];
};

export type PublicSnapshotProjectTranslation = {
  title: string;
  description: string;
  published: boolean;
  language: { code: string };
};

export type PublicSnapshotProject = {
  id: string;
  url: string | null;
  image: string | null;
  gallery: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: PublicSnapshotProjectTranslation[];
};

export type PublicSnapshotSiteOwner = {
  name: string;
  email: string;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  addressData: AddressData | null;
  website: string | null;
  image: string | null;
  bio: string | null;
};

export type PublicSnapshotResume = {
  url: string;
  fileName: string;
};

export type PublicSnapshotSnippet = {
  type: string;
  locale: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
};

export type PublicSnapshot = {
  version: typeof PUBLIC_SNAPSHOT_FORMAT_VERSION;
  createdAt: string;
  languages: PublicSnapshotLanguage[];
  categories: PublicSnapshotTaxonomy[];
  tags: PublicSnapshotTaxonomy[];
  blogs: PublicSnapshotBlog[];
  projects: PublicSnapshotProject[];
  siteOwner: PublicSnapshotSiteOwner | null;
  siteResume: PublicSnapshotResume | null;
  siteSnippets: PublicSnapshotSnippet[];
};
