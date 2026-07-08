'use client';

import { useTranslations } from 'next-intl';
import { BrandLoader } from '@/components/loading/brand-loader';

const Loading = () => {
  const t = useTranslations('Loader');

  return (
    <BrandLoader
      ariaLabel={t('ariaLabel')}
      loop={false}
      logoClassName="h-40 w-40 sm:h-48 sm:w-48"
    />
  );
};

export default Loading;
