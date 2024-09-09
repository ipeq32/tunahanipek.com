'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

const GetContactFeature = () => {
  const t = useTranslations('Navbar.Main.Sidebar');

  return (
    <Link
      href={'/contact'}
      className="relative flex justify-center items-center group/start min-w-40 max-xl:w-full h-12 px-6 py-3 border border-slate-600 hover:border-slate-400 rounded-md"
    >
      <span className="absolute bg-emerald-600 top-0 left-0 w-0 h-0 group-hover/start:w-full group-hover/start:h-full rounded-md transition-all duration-300 ease-linear" />
      <p className="text-sm group-hover/start:leading-loose z-10 transition-colors">
        {t('getContact')}
      </p>
      <span className="absolute bg-emerald-600 bottom-0 right-0 w-0 h-0 group-hover/start:w-full group-hover/start:h-full rounded-md transition-all duration-300 ease-linear" />
    </Link>
  );
};

export default GetContactFeature;
