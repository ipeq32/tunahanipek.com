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
import { useTranslations } from 'next-intl';
import { User } from 'next-auth';
import { Link } from '@/navigation';
import { ComponentProps, useState } from 'react';
import { LogOut, type LucideIcon } from 'lucide-react';
import { buildProfileMenuConfig } from './profile-menu-config';

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
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
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
  const { items, roleLabel, initials } = buildProfileMenuConfig(user, t);

  const close = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        aria-label={t('openMenu')}
        className="rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-teal-500/40"
      >
        <Avatar className="h-9 w-9 rounded-full ring-2 ring-border transition hover:ring-teal-500/40">
          <AvatarImage src={user?.image || FALLBACK_AVATAR} alt="" aria-hidden />
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
            <AvatarImage src={user?.image || FALLBACK_AVATAR} alt="" aria-hidden />
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

        {items.map((item, index) => {
          if (item.type === 'link') {
            return (
              <MenuLink
                key={item.label}
                href={item.href}
                icon={item.icon}
                label={item.label}
                onClick={close}
              />
            );
          }

          return (
            <div key={item.label}>
              {index > 0 && <DropdownMenuSeparator />}
              <SectionLabel>{item.label}</SectionLabel>
              {item.items.map((link) => (
                <MenuLink
                  key={link.label}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  onClick={close}
                />
              ))}
            </div>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-red-600 focus:bg-red-500/10 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropdownMenuFeature;
