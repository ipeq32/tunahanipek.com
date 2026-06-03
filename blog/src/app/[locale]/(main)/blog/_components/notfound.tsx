'use client';

import { EmptyState } from '@/components/layout/empty-state';
import { DidYouKnow } from '@/components/ui/did-you-know';
import { useTranslations } from 'next-intl';

const NotfoundComponent = () => {
  const t = useTranslations('Blog.NotFound');

  return (
    <EmptyState
      title={t('title')}
      description={t('description')}
      actionLabel={t('button')}
      actionHref="/blog"
    >
      <DidYouKnow variant="inline" className="mt-5 max-w-md" />
    </EmptyState>
  );
};

export default NotfoundComponent;
