'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

const CallMeFeature = () => {
  const t = useTranslations('Navbar.Main.Sidebar');

  return (
    <Link
      href="tel:+905416064488"
      className="hidden items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm transition-colors hover:border-teal-500/40 lg:flex"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
        <Phone className="h-4 w-4" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-xs text-muted-foreground">{t('callMe')}</span>
        <span className="font-medium">+90 541 606 4488</span>
      </span>
    </Link>
  );
};

export default CallMeFeature;
