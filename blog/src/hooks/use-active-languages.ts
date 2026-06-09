'use client';

import { useActiveLanguagesContext } from '@/components/providers/active-languages-provider';

export function useActiveLanguages() {
  const languages = useActiveLanguagesContext();

  return {
    languages,
    loading: false,
  };
}
