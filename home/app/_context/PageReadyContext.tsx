"use client";

import { createContext, useContext } from "react";

const PageReadyContext = createContext(false);

export const usePageReady = () => useContext(PageReadyContext);

type PageReadyProviderProps = {
  ready: boolean;
  children: React.ReactNode;
};

export const PageReadyProvider = ({
  ready,
  children,
}: PageReadyProviderProps) => (
  <PageReadyContext.Provider value={ready}>{children}</PageReadyContext.Provider>
);
