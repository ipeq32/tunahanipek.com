export const PERMISSIONS = {
  'blog:read': 'blog:read',
  'blog:create': 'blog:create',
  'blog:update': 'blog:update',
  'blog:update-any': 'blog:update-any',
  'blog:delete': 'blog:delete',
  'blog:delete-any': 'blog:delete-any',
  'blog:publish': 'blog:publish',
  'blog:auto-publish': 'blog:auto-publish',
  'blog:admin-list': 'blog:admin-list',

  'comment:create': 'comment:create',
  'comment:react': 'comment:react',
  'comment:moderate': 'comment:moderate',

  'project:read': 'project:read',
  'project:create': 'project:create',
  'project:update': 'project:update',
  'project:delete': 'project:delete',
  'project:admin-list': 'project:admin-list',

  'user:read': 'user:read',
  'user:update-role': 'user:update-role',
  'user:delete': 'user:delete',

  'role:read': 'role:read',
  'role:create': 'role:create',
  'role:update': 'role:update',
  'role:delete': 'role:delete',

  'ai:status': 'ai:status',
  'ai:content-blog': 'ai:content-blog',
  'ai:content-project': 'ai:content-project',
  'ai:settings-read': 'ai:settings-read',
  'ai:settings-update': 'ai:settings-update',
  'ai:settings-test': 'ai:settings-test',

  'resume:read': 'resume:read',
  'resume:update': 'resume:update',
  'resume:delete': 'resume:delete',

  'upload:profile-image': 'upload:profile-image',
  'upload:blog-image': 'upload:blog-image',
  'upload:cv': 'upload:cv',
  'upload:delete': 'upload:delete',

  'profile:update': 'profile:update',
  'password:update': 'password:update',
  'account:read': 'account:read',
  'account:unlink': 'account:unlink',
  'account:link': 'account:link',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export type PermissionGroup = {
  key: string;
  labelKey: string;
  permissions: Permission[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'blog',
    labelKey: 'groups.blog',
    permissions: [
      PERMISSIONS['blog:read'],
      PERMISSIONS['blog:create'],
      PERMISSIONS['blog:update'],
      PERMISSIONS['blog:update-any'],
      PERMISSIONS['blog:delete'],
      PERMISSIONS['blog:delete-any'],
      PERMISSIONS['blog:publish'],
      PERMISSIONS['blog:auto-publish'],
      PERMISSIONS['blog:admin-list'],
    ],
  },
  {
    key: 'comment',
    labelKey: 'groups.comment',
    permissions: [
      PERMISSIONS['comment:create'],
      PERMISSIONS['comment:react'],
      PERMISSIONS['comment:moderate'],
    ],
  },
  {
    key: 'project',
    labelKey: 'groups.project',
    permissions: [
      PERMISSIONS['project:read'],
      PERMISSIONS['project:create'],
      PERMISSIONS['project:update'],
      PERMISSIONS['project:delete'],
      PERMISSIONS['project:admin-list'],
    ],
  },
  {
    key: 'user',
    labelKey: 'groups.user',
    permissions: [
      PERMISSIONS['user:read'],
      PERMISSIONS['user:update-role'],
      PERMISSIONS['user:delete'],
    ],
  },
  {
    key: 'role',
    labelKey: 'groups.role',
    permissions: [
      PERMISSIONS['role:read'],
      PERMISSIONS['role:create'],
      PERMISSIONS['role:update'],
      PERMISSIONS['role:delete'],
    ],
  },
  {
    key: 'ai',
    labelKey: 'groups.ai',
    permissions: [
      PERMISSIONS['ai:status'],
      PERMISSIONS['ai:content-blog'],
      PERMISSIONS['ai:content-project'],
      PERMISSIONS['ai:settings-read'],
      PERMISSIONS['ai:settings-update'],
      PERMISSIONS['ai:settings-test'],
    ],
  },
  {
    key: 'resume',
    labelKey: 'groups.resume',
    permissions: [
      PERMISSIONS['resume:read'],
      PERMISSIONS['resume:update'],
      PERMISSIONS['resume:delete'],
    ],
  },
  {
    key: 'upload',
    labelKey: 'groups.upload',
    permissions: [
      PERMISSIONS['upload:profile-image'],
      PERMISSIONS['upload:blog-image'],
      PERMISSIONS['upload:cv'],
      PERMISSIONS['upload:delete'],
    ],
  },
  {
    key: 'profile',
    labelKey: 'groups.profile',
    permissions: [
      PERMISSIONS['profile:update'],
      PERMISSIONS['password:update'],
      PERMISSIONS['account:read'],
      PERMISSIONS['account:unlink'],
      PERMISSIONS['account:link'],
    ],
  },
];

export const SYSTEM_ROLE_SLUGS = {
  member: 'member',
  superAdmin: 'super-admin',
} as const;

export type SystemRoleSlug =
  (typeof SYSTEM_ROLE_SLUGS)[keyof typeof SYSTEM_ROLE_SLUGS];

const MEMBER_PERMISSIONS: Permission[] = [
  PERMISSIONS['blog:read'],
  PERMISSIONS['project:read'],
  PERMISSIONS['comment:create'],
  PERMISSIONS['comment:react'],
  PERMISSIONS['profile:update'],
  PERMISSIONS['password:update'],
  PERMISSIONS['account:read'],
  PERMISSIONS['account:unlink'],
  PERMISSIONS['account:link'],
  PERMISSIONS['upload:profile-image'],
  PERMISSIONS['upload:delete'],
];

/** Minimum permissions every custom role must include. */
export const DEFAULT_ROLE_PERMISSIONS: Permission[] = [...MEMBER_PERMISSIONS];

export function isDefaultRolePermission(value: string): value is Permission {
  return DEFAULT_ROLE_PERMISSIONS.includes(value as Permission);
}

export function withDefaultRolePermissions(permissions: string[]): Permission[] {
  return normalizePermissions([
    ...DEFAULT_ROLE_PERMISSIONS,
    ...permissions,
  ]) as Permission[];
}

export const SYSTEM_ROLE_PRESETS: Array<{
  name: string;
  slug: SystemRoleSlug;
  description: string;
  permissions: string[];
  legacyRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}> = [
  {
    name: 'Üye',
    slug: SYSTEM_ROLE_SLUGS.member,
    description: 'Temel site erişimi ve profil yönetimi',
    permissions: MEMBER_PERMISSIONS,
    legacyRole: 'USER',
  },
  {
    name: 'Süper Admin',
    slug: SYSTEM_ROLE_SLUGS.superAdmin,
    description:
      'Sistem yöneticisi rolü — tam yetki yalnızca ana süper admin e-postasına aittir',
    permissions: [],
    legacyRole: 'SUPER_ADMIN',
  },
];

export function isValidPermission(value: string): value is Permission {
  return ALL_PERMISSIONS.includes(value as Permission);
}

export function normalizePermissions(permissions: string[]): string[] {
  return [...new Set(permissions.filter(isValidPermission))].sort();
}

export function hasPermission(
  userPermissions: string[] | undefined,
  permission: Permission
): boolean {
  if (!userPermissions?.length) {
    return false;
  }

  return userPermissions.includes(permission);
}

export function hasAnyPermission(
  userPermissions: string[] | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) =>
    hasPermission(userPermissions, permission)
  );
}

export function hasAllPermissions(
  userPermissions: string[] | undefined,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) =>
    hasPermission(userPermissions, permission)
  );
}
