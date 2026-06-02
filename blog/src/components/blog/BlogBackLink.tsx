'use client';

import { useRouter } from '@/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BlogBackLink() {
  const router = useRouter();
  const t = useTranslations('Blog.Taxonomy');

  const handleBack = () => {
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    const hasSameOriginReferrer =
      referrer.length > 0 &&
      (() => {
        try {
          return new URL(referrer).origin === window.location.origin;
        } catch {
          return false;
        }
      })();

    if (hasSameOriginReferrer) {
      router.back();
      return;
    }
    router.push('/blog');
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-teal-600 dark:hover:text-teal-400"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {t('back')}
    </button>
  );
}
