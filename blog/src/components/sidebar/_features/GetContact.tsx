'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

type GetContactFeatureProps = {
  onNavigate?: () => void;
};

const GetContactFeature = ({ onNavigate }: GetContactFeatureProps) => {
  const t = useTranslations('Navbar.Main.Sidebar');

  return (
    <Link
      href="/contact"
      onClick={onNavigate}
      className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-teal-500/25 bg-teal-500/10 px-4 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-500/15 dark:text-teal-300 xl:w-auto"
    >
      {t('getContact')}
    </Link>
  );
};

export default GetContactFeature;
