'use client';

import { createContext, useContext } from 'react';
import type { LanguageDto } from '@/lib/language-fallback';
import { getStaticLanguageFallback } from '@/lib/language-fallback';

const ActiveLanguagesContext = createContext<LanguageDto[]>(
  getStaticLanguageFallback(),
);

type ActiveLanguagesProviderProps = {
  languages: LanguageDto[];
  children: React.ReactNode;
};

export function ActiveLanguagesProvider({
  languages,
  children,
}: ActiveLanguagesProviderProps) {
  return (
    <ActiveLanguagesContext.Provider value={languages}>
      {children}
    </ActiveLanguagesContext.Provider>
  );
}

export function useActiveLanguagesContext(): LanguageDto[] {
  return useContext(ActiveLanguagesContext);
}
