import type { SiteSnippetType } from '@prisma/client';

export type SiteSnippetDto = {
  id: string;
  type: SiteSnippetType;
  locale: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

export type ReplaceSiteSnippetsInput = {
  type: SiteSnippetType;
  locale: string;
  items: Array<{
    content: string;
    isActive?: boolean;
  }>;
};
