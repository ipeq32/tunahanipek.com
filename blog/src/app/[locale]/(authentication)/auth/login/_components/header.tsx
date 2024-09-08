'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

function HeaderComponent() {
  const t = useTranslations('Authentication.Login.Page');

  return (
    <motion.h1
      animate={{ y: 0 }}
      initial={{ y: -100 }}
      transition={{
        ease: 'circInOut',
        duration: 2,
        y: { duration: 1 },
      }}
      className="text-4xl font-bold text-black dark:text-white mt-5"
    >
      {t('title')}
    </motion.h1>
  );
}

export default HeaderComponent;
