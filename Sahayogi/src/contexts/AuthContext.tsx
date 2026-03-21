import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'donor' | 'recipient' | 'admin';
  full_name?: string;
  avatar_url?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  authStatus: AuthStatus;
  /** Derived — never stored separately */
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { API_URL } from '@/config';

const fetchMe = async (token: string): Promise<User | null> => {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const navigate = useNavigate();

  // Derived – never stored separately to avoid desync
  const isAdmin = user?.role === 'admin';

  /* ─── initAuth: called once on mount ─────────────────────────────────── */
  useEffect(() => {
    const initAuth = async () => {
      setAuthStatus('loading');
      const token = sessionStorage.getItem('sahayogi_token');
      if (!token) {
        setAuthStatus('unauthenticated');
        return;
      }
      const me = await fetchMe(token);
      if (me) {
        setUser(me);
        setAuthStatus('authenticated');
      } else {
        // Token invalid / expired — remove it
        sessionStorage.removeItem('sahayogi_token');
        setAuthStatus('unauthenticated');
      }
    };
    initAuth();
  }, []);

  /* ─── signUp ─────────────────────────────────────────────────────────── */
  const signUp = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ error: any }> => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error } };

      sessionStorage.setItem('sahayogi_token', data.token);

      // Always validate via /auth/me — never trust the signup payload alone
      const me = await fetchMe(data.token);
      if (me) {
        setUser(me);
        setAuthStatus('authenticated');
        navigate(me.role === 'admin' ? '/admin/dashboard' : '/feed', { replace: true });
      }
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  };

  /* ─── signIn ─────────────────────────────────────────────────────────── */
  const signIn = async (email: string, password: string): Promise<{ error: any }> => {
    try {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error } };

      sessionStorage.setItem('sahayogi_token', data.token);

      // Always validate via /auth/me
      const me = await fetchMe(data.token);
      if (me) {
        setUser(me);
        setAuthStatus('authenticated');
        navigate(me.role === 'admin' ? '/admin/dashboard' : '/feed', { replace: true });
      }
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  };

  /* ─── signOut ────────────────────────────────────────────────────────── */
  const signOut = async (): Promise<void> => {
    // 1. Remove token
    sessionStorage.removeItem('sahayogi_token');
    // 2. Clear any other persisted cache keys
    sessionStorage.clear();
    // 3. Reset auth state
    setUser(null);
    setAuthStatus('unauthenticated');
    // 4. Navigate
    navigate('/auth/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, authStatus, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
