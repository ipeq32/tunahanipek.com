import { describe, expect, it, vi, beforeEach } from 'vitest';

const { revalidatePathMock } = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock('@/navigation', () => ({
  getPathname: ({
    locale,
    href,
  }: {
    locale: string;
    href: string | { pathname: string; params: Record<string, string> };
  }) => {
    if (typeof href === 'string') {
      if (href === '/') return '/';
      if (href === '/blog') return '/blog';
      if (href === '/project') return locale === 'tr' ? '/proje' : '/project';
      return href;
    }
    if (href.pathname === '/blog/[id]') return `/blog/${href.params.id}`;
    if (href.pathname === '/project/[id]') {
      return locale === 'tr'
        ? `/proje/${href.params.id}`
        : `/project/${href.params.id}`;
    }
    return href.pathname;
  },
}));

import {
  revalidateBlogDetail,
  revalidateBlogList,
  revalidateProjectDetail,
} from './revalidate-public';

describe('revalidate-public', () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
  });

  it('revalidateBlogList invalidates home and blog for each locale', () => {
    revalidateBlogList();

    expect(revalidatePathMock).toHaveBeenCalledWith('/en');
    expect(revalidatePathMock).toHaveBeenCalledWith('/tr');
    expect(revalidatePathMock).toHaveBeenCalledWith('/en/blog');
    expect(revalidatePathMock).toHaveBeenCalledWith('/tr/blog');
    expect(revalidatePathMock).toHaveBeenCalledWith('/sitemap.xml');
    expect(revalidatePathMock).toHaveBeenCalledWith('/feed.xml');
  });

  it('revalidateBlogDetail includes post path', () => {
    revalidateBlogDetail('post-1');

    expect(revalidatePathMock).toHaveBeenCalledWith('/en/blog/post-1');
    expect(revalidatePathMock).toHaveBeenCalledWith('/tr/blog/post-1');
  });

  it('revalidateProjectDetail uses localized project paths', () => {
    revalidateProjectDetail('proj-1');

    expect(revalidatePathMock).toHaveBeenCalledWith('/en/project/proj-1');
    expect(revalidatePathMock).toHaveBeenCalledWith('/tr/proje/proj-1');
  });
});
