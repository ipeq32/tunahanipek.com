'use client';

import { Clock3, Github, Instagram, Linkedin, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { ToggleTheme } from '../toggle-theme';
import ToggleLanguage from '../toggle-language';
import { useTranslations } from 'next-intl';

const NavContact = () => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  const t = useTranslations('Navbar.Contact');

  const currentDay = new Date().toLocaleDateString('tr', { weekday: 'long' });
  const currentHour = new Date().getHours();

  useEffect(() => {
    if (
      ((currentDay !== 'Saturday' && currentDay !== 'Sunday') && currentHour < 8) ||
      currentHour > 18
    ) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [currentDay, currentHour]);

  return (
    <div className="border-b border-border/40 bg-brand-muted/50 dark:bg-secondary/50">
      <div className="container flex h-10 items-center justify-between gap-4">
        <div className="hidden items-center gap-2 lg:flex">
          <Stethoscope width={16} height={16} className="animate-pulse text-teal-600 dark:text-teal-400" />
          <div className="flex max-w-md items-center overflow-hidden">
            <p className="animate-text-slide whitespace-nowrap text-xs text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-1 items-center justify-end gap-4 lg:w-auto">
          <div className="hidden items-center gap-2 text-xs lg:flex">
            <Clock3 width={14} height={14} className="animate-spin-slow text-muted-foreground" />
            <div
              className={`flex items-center overflow-hidden border-b ${
                isOpen ? 'border-teal-500/50' : 'border-rose-400/50'
              }`}
            >
              <span className="animate-text-slide-slow max-w-[250px] whitespace-nowrap text-muted-foreground max-sm:hidden">
                {t('time')}
              </span>
              <span className="hidden max-sm:block text-muted-foreground">{currentDay}</span>
            </div>
            <span
              className={
                isOpen
                  ? 'font-medium text-teal-600 dark:text-teal-400'
                  : 'font-medium text-rose-500'
              }
            >
              {isOpen ? t('Status.open') : t('Status.close')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/ipeq32"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <Github width={16} height={16} />
            </Link>
            <Link
              href="https://www.instagram.com/tnhnipek"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram width={16} height={16} />
            </Link>
            <Link
              href="https://www.linkedin.com/in/tunahanipek"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="LinkedIn"
            >
              <Linkedin width={16} height={16} />
            </Link>
            <div className="ml-1 flex items-center gap-2 border-l border-border/60 pl-3">
              <ToggleTheme />
              <ToggleLanguage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavContact;
