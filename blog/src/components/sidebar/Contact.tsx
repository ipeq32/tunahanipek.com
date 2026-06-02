'use client';

import { Clock3, Github, Instagram, Linkedin, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { ToggleTheme } from '../toggle-theme';
import ToggleLanguage from '../toggle-language';
import { useTranslations } from 'next-intl';

const NavContact = () => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null); // Burası backendden getirilecek veriye göre değiştir.

  const t = useTranslations('Navbar.Contact');

  const currentDay = new Date().toLocaleDateString('tr', { weekday: 'long' });
  const currentHour = new Date().getHours();

  useEffect(() => {
    if (
      ((currentDay !== 'Saturday' && currentDay !== 'Sunday') && currentHour < 8) ||
      currentHour > 18
    ) {
      return setIsOpen(false);
    } else {
      return setIsOpen(true);
    }
  }, [currentDay, currentHour, t]);

  return (
    <div className="flex items-center justify-center h-12 bg-cyan-50 dark:bg-indigo-950 max-2xl:px-10">
      <div className="flex flex-row justify-between max-w-screen-xl w-full">
        <div className="flex flex-row items-center gap-2 max-lg:hidden">
          <Stethoscope width={20} height={20} className="animate-pulse" />
          <div className="flex items-center overflow-hidden">
            <p className="text-sm animate-text-slide whitespace-nowrap">
              {t('description')}
            </p>
          </div>
        </div>
        {/* contact */}
        <div className="flex flex-row justify-end max-md:justify-evenly items-center w-full gap-10">
          <div className="flex flex-row items-center gap-2 max-lg:hidden">
            <Clock3 width={20} height={20} className="animate-spin-slow" />
            <div className="flex flex-row gap-2 text-sm">
              <div
                className={`flex items-center overflow-hidden border-b ${
                  isOpen ? 'border-sky-400' : 'border-rose-400'
                }`}
              >
                <span className="max-sm:hidden animate-text-slide-slow whitespace-nowrap max-w-[250px]">
                  {t('time')}
                </span>
                <span className="max-sm:block hidden">{currentDay}</span>
              </div>
              <span
                className={`select-none ${
                  isOpen
                    ? 'text-green-500 cursor-grab'
                    : 'text-red-500 cursor-wait'
                }`}
              >
                {isOpen ? t('Status.open') : t('Status.close')}
              </span>
            </div>
          </div>
          <div className="flex max-md:flex-row-reverse justify-center items-center gap-2">
            <ToggleTheme />
            <ToggleLanguage />
          </div>
          <div className="flex flex-row items-center justify-evenly w-28">
            <Link href="https://github.com/ipeq32" target="_blank">
              <Github
                className="hover:text-stone-500 transition-colors duration-500 ease-linear"
                width={20}
                height={20}
              />
            </Link>
            <Link href="https://www.instagram.com/tnhnipek" target="_blank">
              <Instagram
                className="hover:text-rose-500 transition-colors duration-500 ease-linear"
                width={20}
                height={20}
              />
            </Link>
            <Link
              href="https://www.linkedin.com/in/tunahanipek"
              target="_blank"
            >
              <Linkedin
                className="hover:text-sky-500 transition-colors duration-500 ease-linear"
                width={20}
                height={20}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavContact;
