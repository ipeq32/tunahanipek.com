'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { hasUserPermission } from '@/lib/auth-roles';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { useTranslations } from 'next-intl';
import { User } from 'next-auth';
import { Link } from '@/navigation';
import { ComponentProps, useState } from 'react';
import {
  FolderKanban,
  FolderPlus,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  MessagesSquare,
  PenSquare,
  Settings,
  UserRound,
  Users,
  Shield,
} from 'lucide-react';

const FALLBACK_AVATAR =
  'https://img.icons8.com/?size=100&id=21441&format=png&color=000000';

type ProfileDropdownMenuProps = {
  onLogout: () => void;
  onNavigate?: () => void;
  user: User | undefined;
};

type MenuLinkProps = {
  href: ComponentProps<typeof Link>['href'];
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

function MenuLink({ href, icon: Icon, label, onClick }: MenuLinkProps) {
  return (
    <DropdownMenuItem
      asChild
      className="cursor-pointer rounded-lg px-2 py-2 focus:bg-teal-500/10 focus:text-teal-700 dark:focus:text-teal-300"
    >
      <Link href={href} onClick={onClick} className="flex w-full items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </Link>
    </DropdownMenuItem>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <DropdownMenuLabel className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </DropdownMenuLabel>
  );
}

function ProfileDropdownMenuFeature({
  onLogout,
  onNavigate,
  user,
}: ProfileDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const t = useTranslations('Navbar.Main.Sidebar.Profile');

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
  const roleLabel = user?.accessRoleName ?? t(`roles.${user?.role ?? 'USER'}`);
  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';

  const close = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-teal-500/40">
        <Avatar className="h-9 w-9 rounded-full ring-2 ring-border transition hover:ring-teal-500/40">
          <AvatarImage src={user?.image || FALLBACK_AVATAR} alt={user?.name ?? ''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-xl border border-border/60 bg-card/95 p-1.5 shadow-lg backdrop-blur-md"
      >
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-10 w-10 rounded-full ring-2 ring-teal-500/20">
            <AvatarImage src={user?.image || FALLBACK_AVATAR} alt={user?.name ?? ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {user?.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
            <Badge variant="accent" className="mt-1 text-[10px]">
              {roleLabel}
            </Badge>
          </div>
        </div>

        <DropdownMenuSeparator />

        <MenuLink
          href="/profile"
          icon={UserRound}
          label={t('viewProfile')}
          onClick={close}
        />
        <MenuLink
          href="/setting"
          icon={Settings}
          label={t('settings')}
          onClick={close}
        />

        {canCreateBlog && (
          <>
            <DropdownMenuSeparator />
            <SectionLabel>{t('moderation')}</SectionLabel>
            <MenuLink
              href="/blog/add"
              icon={PenSquare}
              label={t('addBlog')}
              onClick={close}
            />
            {canCreateProject && (
              <MenuLink
                href="/admin/project/add"
                icon={FolderPlus}
                label={t('addProject')}
                onClick={close}
              />
            )}
          </>
        )}

        {(canManageBlog ||
          canManageProjects ||
          canModerateComments ||
          canManageUsers ||
          canManageRoles) && (
          <>
            <DropdownMenuSeparator />
            <SectionLabel>{t('admin')}</SectionLabel>
            {canManageBlog && (
              <MenuLink
                href="/admin/blog"
                icon={LayoutDashboard}
                label={t('manageBlog')}
                onClick={close}
              />
            )}
            {canManageProjects && (
              <MenuLink
                href="/admin/project"
                icon={FolderKanban}
                label={t('manageProject')}
                onClick={close}
              />
            )}
            {canModerateComments && (
              <MenuLink
                href="/admin/comments"
                icon={MessagesSquare}
                label={t('moderateComments')}
                onClick={close}
              />
            )}
            {canManageUsers && (
              <MenuLink
                href="/admin/users"
                icon={Users}
                label={t('manageUsers')}
                onClick={close}
              />
            )}
            {canManageRoles && (
              <MenuLink
                href="/admin/roles"
                icon={Shield}
                label={t('manageRoles')}
                onClick={close}
              />
            )}
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-red-600 focus:bg-red-500/10 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropdownMenuFeature;
