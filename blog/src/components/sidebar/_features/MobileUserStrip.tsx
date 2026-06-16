'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import type { User } from 'next-auth';

const FALLBACK_AVATAR =
  'https://img.icons8.com/?size=100&id=21441&format=png&color=000000';

type MobileUserStripProps = {
  user: User | undefined;
  roleLabel: string;
  initials: string;
};

function MobileUserStrip({ user, roleLabel, initials }: MobileUserStripProps) {
  const t = useTranslations('Navbar.Main.Sidebar.Profile');

  return (
    <div
      className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 px-3 py-3"
      aria-label={t('account')}
    >
      <Avatar className="h-10 w-10 shrink-0 rounded-full">
        <AvatarImage src={user?.image || FALLBACK_AVATAR} alt="" aria-hidden />
        <AvatarFallback className="bg-teal-500/15 text-sm font-semibold text-teal-700 dark:text-teal-300">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">
          {user?.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
      </div>
      <Badge
        variant="accent"
        className="shrink-0 text-[10px] font-medium uppercase tracking-wide"
      >
        {roleLabel}
      </Badge>
    </div>
  );
}

export default MobileUserStrip;
