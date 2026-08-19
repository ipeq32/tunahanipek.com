'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageLoading } from '@/components/layout/page-loading';
import { subscribePendingNavigationStart } from '@/lib/navigation/pending-navigation';
import {
  isAuthPath,
  isInternalNavigationLink,
  isModifiedClick,
} from '@/lib/navigation/scroll-to-top';

const SHOW_DELAY_MS = 80;
const MIN_VISIBLE_MS = 280;
const FAILSAFE_MS = 10_000;

/**
 * App Router `loading.tsx` tıklama anında görünmez; RSC gelene kadar eski sayfa kalır.
 * Overlay'i navigasyon başlar başlamaz gösteriyoruz.
 */
export function NavigationLoading() {
  const t = useTranslations('A11y');
  const [visible, setVisible] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const visibleRef = useRef(false);
  const pendingRef = useRef(false);
  const originHrefRef = useRef('');
  const shownAtRef = useRef(0);
  const showTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);
  const failsafeTimer = useRef<number | undefined>(undefined);
  const finishRef = useRef<() => void>(() => undefined);

  visibleRef.current = visible;

  useEffect(() => {
    const clearTimers = () => {
      window.clearTimeout(showTimer.current);
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(failsafeTimer.current);
    };

    const finish = () => {
      const wasPending = pendingRef.current;
      pendingRef.current = false;
      setNavigating(false);
      window.clearTimeout(showTimer.current);
      window.clearTimeout(failsafeTimer.current);

      if (!wasPending && !visibleRef.current) {
        return;
      }

      const hide = () => {
        visibleRef.current = false;
        setVisible(false);
      };

      if (!visibleRef.current) {
        hide();
        return;
      }

      const remaining = Math.max(
        0,
        MIN_VISIBLE_MS - (Date.now() - shownAtRef.current),
      );
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(hide, remaining);
    };

    finishRef.current = finish;

    const begin = () => {
      if (pendingRef.current) {
        return;
      }

      pendingRef.current = true;
      originHrefRef.current = window.location.href;
      setNavigating(true);
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(showTimer.current);
      window.clearTimeout(failsafeTimer.current);

      showTimer.current = window.setTimeout(() => {
        shownAtRef.current = Date.now();
        visibleRef.current = true;
        setVisible(true);
      }, SHOW_DELAY_MS);

      failsafeTimer.current = window.setTimeout(finish, FAILSAFE_MS);
    };

    const handleClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (!isInternalNavigationLink(anchor)) {
        return;
      }

      if (isAuthPath(anchor.pathname)) {
        return;
      }

      begin();
    };

    const unsubscribe = subscribePendingNavigationStart(begin);
    document.addEventListener('click', handleClick, true);

    return () => {
      unsubscribe();
      document.removeEventListener('click', handleClick, true);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!navigating) {
      return;
    }

    const originHref = originHrefRef.current;
    const tick = () => {
      if (window.location.href !== originHref) {
        finishRef.current();
      }
    };

    const intervalId = window.setInterval(tick, 50);
    return () => window.clearInterval(intervalId);
  }, [navigating]);

  if (!visible) {
    return null;
  }

  return <PageLoading ariaLabel={t('loading')} />;
}
