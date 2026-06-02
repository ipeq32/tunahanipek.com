'use client';

import { Clock3, Github, Instagram, Linkedin, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { ToggleTheme } from '../toggle-theme';
import ToggleLanguage from '../toggle-language';
import { useTranslations } from 'next-intl';
import {
  getOfficeHoursSnapshot,
  type OfficeHoursSnapshot,
} from '@/lib/office-hours';

type NavContactProps = {
  officeHours: OfficeHoursSnapshot;
};

const NavContact = ({ officeHours }: NavContactProps) => {
  const t = useTranslations('Navbar.Contact');
  const [isOpen, setIsOpen] = useState(officeHours.isOpen);
  const [currentDay, setCurrentDay] = useState(officeHours.currentDay);

  useEffect(() => {
    const syncOfficeHours = () => {
      const snapshot = getOfficeHoursSnapshot();
      setIsOpen(snapshot.isOpen);
      setCurrentDay(snapshot.currentDay);
    };

    syncOfficeHours();
    const intervalId = window.setInterval(syncOfficeHours, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

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
              className={`max-w-[250px] overflow-hidden border-b max-sm:hidden ${
                isOpen ? 'border-teal-500/50' : 'border-rose-400/50'
              }`}
              style={{
                maskImage:
                  'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
              }}
            >
              <div className="animate-hours-ticker flex w-max gap-8 whitespace-nowrap text-muted-foreground">
                <span>{t('time')}</span>
                <span aria-hidden="true">{t('time')}</span>
              </div>
            </div>
            <span className="hidden text-muted-foreground max-sm:block">{currentDay}</span>
            <span
              suppressHydrationWarning
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
