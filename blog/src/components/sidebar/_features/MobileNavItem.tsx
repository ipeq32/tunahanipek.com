'use client';

import { Link, usePathname } from '@/navigation';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';

type MobileNavItemProps = {
  href?: ComponentProps<typeof Link>['href'];
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  active?: boolean;
};

function isHrefActive(
  pathname: string,
  href: ComponentProps<typeof Link>['href'] | undefined
) {
  if (!href || typeof href !== 'string') return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileNavItem({
  href,
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  active: activeProp,
}: MobileNavItemProps) {
  const pathname = usePathname();
  const active = activeProp ?? isHrefActive(pathname, href);

  const className = cn(
    'flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30',
    variant === 'danger'
      ? 'text-red-600 hover:bg-red-500/8 dark:text-red-400'
      : active
        ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
        : 'text-foreground/90 hover:bg-muted/60'
  );

  const content = (
    <>
      {Icon ? (
        <Icon
          className={cn(
            'h-[18px] w-[18px] shrink-0',
            variant === 'danger'
              ? 'text-red-500/80 dark:text-red-400/80'
              : active
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-muted-foreground'
          )}
          aria-hidden
        />
      ) : (
        <span className="w-[18px] shrink-0" aria-hidden />
      )}
      <span className="truncate">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default MobileNavItem;
