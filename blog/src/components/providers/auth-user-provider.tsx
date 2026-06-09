'use client';

import { createContext, useContext, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

type AuthUserState = {
  user: Session['user'] | undefined;
  status: 'authenticated' | 'unauthenticated' | 'loading';
};

const AuthUserContext = createContext<AuthUserState>({
  user: undefined,
  status: 'unauthenticated',
});

type AuthUserProviderProps = {
  session: Session | null;
  children: React.ReactNode;
};

export function AuthUserProvider({ session, children }: AuthUserProviderProps) {
  const { data: clientSession, status } = useSession();
  const resolvedSession = clientSession ?? session;

  const value = useMemo<AuthUserState>(() => {
    if (status === 'loading' && !resolvedSession?.user) {
      return { user: undefined, status: 'loading' };
    }

    if (resolvedSession?.user) {
      return { user: resolvedSession.user, status: 'authenticated' };
    }

    return { user: undefined, status: 'unauthenticated' };
  }, [resolvedSession, status]);

  return (
    <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
  );
}

export function useAuthUser(): AuthUserState {
  return useContext(AuthUserContext);
}
