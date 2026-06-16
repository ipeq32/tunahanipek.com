import 'server-only';

export {
  getAccessRoleIdByLegacyRole,
  getDefaultAccessRoleId,
  resolveLegacyRoleFromAccessRoleId,
  seedAccessRoles,
  syncUserLegacyRole,
} from '@/lib/db/access-role-store';
