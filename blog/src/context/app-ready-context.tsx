'use client';

import { createContext, useContext } from 'react';

const AppReadyContext = createContext(false);

export function useAppReady() {
  return useContext(AppReadyContext);
}

export function AppReadyProvider({
  ready,
  children,
}: {
  ready: boolean;
  children: React.ReactNode;
}) {
  return (
    <AppReadyContext.Provider value={ready}>{children}</AppReadyContext.Provider>
  );
}
