'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginResponse } from '@/types';
import { api } from '@/lib/api';
import { saveSession, getSession, clearSession } from '@/lib/session';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session.user);
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    saveSession(response.data.token, response.data.user);
    setUser(response.data.user);
    router.push('/dashboard');
  }

  function logout(): void {
    clearSession();
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
