'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

function HeaderComponent() {
  const t = useTranslations('Authentication.Register.Page');

  return (
    <motion.h1
      animate={{ y: 0 }}
      initial={{ y: -100 }}
      transition={{
        ease: 'circInOut',
        duration: 2,
        y: { duration: 1 },
      }}
      className="sticky top-0 text-4xl font-bold text-black dark:text-white mt-5 backdrop-blur-md max-md:w-full max-md:text-center"
    >
      {t('title')}
    </motion.h1>
  );
}

export default HeaderComponent;
