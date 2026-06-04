'use client';

import { useTranslations } from 'next-intl';
import { SignatureLogo } from '@/components/ui/signature-logo';

const Loading = () => {
  const t = useTranslations('Loader');

  return (
    <div className="preloader-content" role="status" aria-label={t('ariaLabel')}>
      <SignatureLogo
        gradientId="loader-signature-gradient"
        className="loader-logo-emphasis h-40 w-40 sm:h-48 sm:w-48"
      />
    </div>
  );
};

export default Loading;
