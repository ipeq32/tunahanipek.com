import { describe, expect, it } from 'vitest';
import { canAutoPublish, isModerator, isSuperAdmin } from './auth-roles';

describe('auth-roles', () => {
  it('identifies moderators', () => {
    expect(isModerator('ADMIN')).toBe(true);
    expect(isModerator('SUPER_ADMIN')).toBe(true);
    expect(isModerator('USER')).toBe(false);
  });

  it('identifies super admin', () => {
    expect(isSuperAdmin('SUPER_ADMIN')).toBe(true);
    expect(isSuperAdmin('ADMIN')).toBe(false);
  });

  it('allows auto publish for moderators', () => {
    expect(canAutoPublish('ADMIN')).toBe(true);
    expect(canAutoPublish('USER')).toBe(false);
  });
});
