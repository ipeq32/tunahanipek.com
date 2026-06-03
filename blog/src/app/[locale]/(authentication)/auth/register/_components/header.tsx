'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

function HeaderComponent() {
  const t = useTranslations('Authentication.Register.Page');

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-1.5 text-center sm:text-left"
    >
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {t('title')}
      </h1>
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
    </motion.div>
  );
}

export default HeaderComponent;
