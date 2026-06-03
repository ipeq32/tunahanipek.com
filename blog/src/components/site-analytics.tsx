'use client';

import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';
import { COOKIE_CONSENT_KEY } from '@/components/cookie-consent';

export function SiteAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const readConsent = () => {
      setEnabled(localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted');
    };
    readConsent();
    window.addEventListener('cookie-consent-change', readConsent);
    return () => window.removeEventListener('cookie-consent-change', readConsent);
  }, []);

  if (!enabled) {
    return null;
  }

  return <Analytics />;
}
