import { describe, expect, it } from 'vitest';

import {
  adminPages,
  authPages,
  protectedPages,
  testPagesRegex,
} from '@/lib/route-access';

describe('route-access', () => {
  it('keeps public project pages open in both locales', () => {
    expect(testPagesRegex(protectedPages, '/en/project')).toBe(false);
    expect(testPagesRegex(protectedPages, '/tr/proje')).toBe(false);
    expect(testPagesRegex(protectedPages, '/en/project/abc')).toBe(false);
    expect(testPagesRegex(protectedPages, '/tr/proje/abc')).toBe(false);
  });

  it('protects profile, settings and blog authoring routes', () => {
    expect(testPagesRegex(protectedPages, '/tr/profil')).toBe(true);
    expect(testPagesRegex(protectedPages, '/en/setting')).toBe(true);
    expect(testPagesRegex(protectedPages, '/tr/blog/ekle')).toBe(true);
    expect(testPagesRegex(protectedPages, '/en/blog/abc/edit')).toBe(true);
    expect(testPagesRegex(protectedPages, '/tr/blog/abc/duzenle')).toBe(true);
  });

  it('keeps public blog and about pages open', () => {
    expect(testPagesRegex(protectedPages, '/tr/blog')).toBe(false);
    expect(testPagesRegex(protectedPages, '/en/blog/abc')).toBe(false);
    expect(testPagesRegex(protectedPages, '/tr/hakkimda')).toBe(false);
    expect(testPagesRegex(adminPages, '/tr/proje')).toBe(false);
  });

  it('recognizes admin project routes', () => {
    expect(testPagesRegex(adminPages, '/en/admin/project')).toBe(true);
    expect(testPagesRegex(adminPages, '/tr/admin/proje')).toBe(true);
    expect(testPagesRegex(adminPages, '/tr/admin/proje/ekle')).toBe(true);
  });

  it('recognizes auth pages', () => {
    expect(testPagesRegex(authPages, '/tr/yetkilendirme/giris-yap')).toBe(true);
    expect(testPagesRegex(authPages, '/en/auth/login')).toBe(true);
  });
});
