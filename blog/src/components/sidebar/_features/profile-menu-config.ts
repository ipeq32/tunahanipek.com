import { hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import type { ComponentProps } from 'react';
import type { Link } from '@/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  FolderKanban,
  FolderPlus,
  LayoutDashboard,
  MessagesSquare,
  PenSquare,
  Settings,
  Shield,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import type { User } from 'next-auth';

export type ProfileMenuLink = {
  type: 'link';
  href: ComponentProps<typeof Link>['href'];
  icon: LucideIcon;
  label: string;
};

export type ProfileMenuSection = {
  type: 'section';
  label: string;
  items: ProfileMenuLink[];
};

export type ProfileMenuItem = ProfileMenuLink | ProfileMenuSection;

type ProfileMenuTranslator = (
  key:
    | 'viewProfile'
    | 'settings'
    | 'moderation'
    | 'addBlog'
    | 'addProject'
    | 'admin'
    | 'manageBlog'
    | 'manageProject'
    | 'moderateComments'
    | 'manageUsers'
    | 'manageRoles'
    | 'manageSiteCopy'
    | `roles.${string}`
) => string;

export function buildProfileMenuConfig(
  user: User | undefined,
  t: ProfileMenuTranslator
) {
  const permissions = user?.permissions ?? [];
  const email = user?.email;

  const canCreateBlog = hasUserPermission(
    permissions,
    PERMISSIONS['blog:create'],
    email
  );
  const canManageBlog = hasUserPermission(
    permissions,
    PERMISSIONS['blog:admin-list'],
    email
  );
  const canManageProjects = hasUserPermission(
    permissions,
    PERMISSIONS['project:admin-list'],
    email
  );
  const canCreateProject = hasUserPermission(
    permissions,
    PERMISSIONS['project:create'],
    email
  );
  const canModerateComments = hasUserPermission(
    permissions,
    PERMISSIONS['comment:moderate'],
    email
  );
  const canManageUsers = hasUserPermission(
    permissions,
    PERMISSIONS['user:read'],
    email
  );
  const canManageRoles = hasUserPermission(
    permissions,
    PERMISSIONS['role:read'],
    email
  );
  const canManageSiteCopy = hasUserPermission(
    permissions,
    PERMISSIONS['site-copy:read'],
    email
  );

  const roleLabel = user?.accessRoleName ?? t(`roles.${user?.role ?? 'USER'}`);
  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';

  const items: ProfileMenuItem[] = [
    {
      type: 'link',
      href: '/profile',
      icon: UserRound,
      label: t('viewProfile'),
    },
    {
      type: 'link',
      href: '/setting',
      icon: Settings,
      label: t('settings'),
    },
  ];

  const moderationItems: ProfileMenuLink[] = [];

  if (canCreateBlog) {
    moderationItems.push({
      type: 'link',
      href: '/blog/add',
      icon: PenSquare,
      label: t('addBlog'),
    });
  }

  if (canCreateProject) {
    moderationItems.push({
      type: 'link',
      href: '/admin/project/add',
      icon: FolderPlus,
      label: t('addProject'),
    });
  }

  if (moderationItems.length > 0) {
    items.push({
      type: 'section',
      label: t('moderation'),
      items: moderationItems,
    });
  }

  const adminItems: ProfileMenuLink[] = [];

  if (canManageBlog) {
    adminItems.push({
      type: 'link',
      href: '/admin/blog',
      icon: LayoutDashboard,
      label: t('manageBlog'),
    });
  }

  if (canManageProjects) {
    adminItems.push({
      type: 'link',
      href: '/admin/project',
      icon: FolderKanban,
      label: t('manageProject'),
    });
  }

  if (canModerateComments) {
    adminItems.push({
      type: 'link',
      href: '/admin/comments',
      icon: MessagesSquare,
      label: t('moderateComments'),
    });
  }

  if (canManageUsers) {
    adminItems.push({
      type: 'link',
      href: '/admin/users',
      icon: Users,
      label: t('manageUsers'),
    });
  }

  if (canManageRoles) {
    adminItems.push({
      type: 'link',
      href: '/admin/roles',
      icon: Shield,
      label: t('manageRoles'),
    });
  }

  if (canManageSiteCopy) {
    adminItems.push({
      type: 'link',
      href: '/admin/site-copy',
      icon: Sparkles,
      label: t('manageSiteCopy'),
    });
  }

  if (adminItems.length > 0) {
    items.push({
      type: 'section',
      label: t('admin'),
      items: adminItems,
    });
  }

  return { items, roleLabel, initials };
}
