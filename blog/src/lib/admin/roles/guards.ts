import 'server-only';

import {
  ALL_PERMISSIONS,
  normalizePermissions,
} from '@/lib/auth/permissions';
import type { AccessRoleMutationErrorCode } from '@/lib/admin/roles/types';

export class AccessRoleMutationError extends Error {
  constructor(public readonly code: AccessRoleMutationErrorCode) {
    super(code);
    this.name = 'AccessRoleMutationError';
  }
}

export function assertValidRolePermissions(permissions: string[]): string[] {
  const normalized = normalizePermissions(permissions);

  if (!normalized.length) {
    throw new AccessRoleMutationError('INVALID_PERMISSIONS');
  }

  const invalid = permissions.filter(
    (item) => !ALL_PERMISSIONS.includes(item as never)
  );

  if (invalid.length) {
    throw new AccessRoleMutationError('INVALID_PERMISSIONS');
  }

  return normalized;
}

export function assertCanMutateRole(isSystem: boolean): void {
  if (isSystem) {
    throw new AccessRoleMutationError('ROLE_SYSTEM_IMMUTABLE');
  }
}
