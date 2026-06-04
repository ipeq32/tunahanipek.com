'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export const COOKIE_CONSENT_KEY = 'cookie-consent';

export function CookieConsent() {
  const t = useTranslations('CookieConsent');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const setConsent = (value: 'accepted' | 'declined') => {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.dispatchEvent(new Event('cookie-consent-change'));
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  const titleId = 'cookie-consent-title';

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-lg rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur-xl md:left-auto md:right-6"
    >
      <p id={titleId} className="text-sm font-semibold text-foreground">
        {t('title')}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t('message')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="accent" onClick={() => setConsent('accepted')}>
          {t('accept')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConsent('declined')}>
          {t('decline')}
        </Button>
      </div>
    </div>
  );
}
