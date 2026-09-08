'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, tokenStore, unwrap } from './api';

export interface MemberUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  accountType: 'MEMBER' | 'STAFF';
  language: string;
  memberCode?: string | null;
  memberProfileId?: string | null;
}

interface AuthValue {
  user: MemberUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MemberUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!tokenStore.access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await unwrap<MemberUser>(api.get('/auth/me'));
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await unwrap<{ tokens: { accessToken: string; refreshToken: string } }>(
        api.post('/auth/login', { email, password }),
      );
      tokenStore.set(res.tokens.accessToken, res.tokens.refreshToken);
      await loadMe();
    },
    [loadMe],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await unwrap<{ tokens: { accessToken: string; refreshToken: string } }>(
        api.post('/auth/register', input),
      );
      tokenStore.set(res.tokens.accessToken, res.tokens.refreshToken);
      await loadMe();
    },
    [loadMe],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', { refreshToken: tokenStore.refresh });
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, loading, login, register, logout, refresh: loadMe }),
    [user, loading, login, register, logout, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
