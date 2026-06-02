export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export function isModerator(role?: string): role is 'ADMIN' | 'SUPER_ADMIN' {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isSuperAdmin(role?: string): role is 'SUPER_ADMIN' {
  return role === 'SUPER_ADMIN';
}

export function canAutoPublish(role?: string): boolean {
  return isModerator(role);
}
