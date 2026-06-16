'use client';

import { useTranslations } from 'next-intl';
import type { User } from 'next-auth';
import { buildProfileMenuConfig } from './profile-menu-config';
import MobileNavItem from './MobileNavItem';

type MobileProfileMenuProps = {
  onNavigate?: () => void;
  user: User | undefined;
};

function MobileSectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
      {children}
    </p>
  );
}

function MobileProfileMenu({ onNavigate, user }: MobileProfileMenuProps) {
  const t = useTranslations('Navbar.Main.Sidebar.Profile');
  const { items } = buildProfileMenuConfig(user, t);

  const handleNavigate = () => {
    onNavigate?.();
  };

  return (
    <nav aria-label={t('account')} className="mt-2 flex flex-col gap-0.5">
      {items.map((item) => {
        if (item.type === 'link') {
          return (
            <MobileNavItem
              key={item.label}
              href={item.href}
              icon={item.icon}
              label={item.label}
              onClick={handleNavigate}
            />
          );
        }

        return (
          <div key={item.label}>
            <MobileSectionLabel>{item.label}</MobileSectionLabel>
            {item.items.map((link) => (
              <MobileNavItem
                key={link.label}
                href={link.href}
                icon={link.icon}
                label={link.label}
                onClick={handleNavigate}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

export default MobileProfileMenu;
