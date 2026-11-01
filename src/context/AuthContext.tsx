import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';

export const ADMIN_EMAIL = 'ashleyghose64@gmail.com';

export interface User {
  email: string;
  name?: string;
  role?: 'admin' | 'candidate';
  grade?: string;
  board?: string;
  school?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name?: string) => void;
  register: (data: { name: string; email: string; grade?: string; board?: string; school?: string }) => void;
  loginWithRedirect: (customEmail?: string) => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = 'learnready_auth_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, name?: string) => {
    const isTargetAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const existing = StorageService.findUserByEmail(email);

    const sessionUser: User = {
      email: email.trim(),
      name: name || existing?.name || email.split('@')[0],
      role: isTargetAdmin ? 'admin' : 'candidate',
      grade: existing?.grade,
      board: existing?.board,
      school: existing?.school,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const register = (data: { name: string; email: string; grade?: string; board?: string; school?: string }) => {
    const isTargetAdmin = data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    StorageService.saveUserAccount({
      name: data.name,
      email: data.email,
      role: isTargetAdmin ? 'admin' : 'candidate',
      grade: data.grade,
      board: data.board,
      school: data.school,
    });

    const sessionUser: User = {
      email: data.email,
      name: data.name,
      role: isTargetAdmin ? 'admin' : 'candidate',
      grade: data.grade,
      board: data.board,
      school: data.school,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const loginWithRedirect = (emailToUse?: string) => {
    const targetEmail = emailToUse || ADMIN_EMAIL;
    login(targetEmail);
  };

  const loginAsAdmin = () => {
    login(ADMIN_EMAIL, 'Super Admin');
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithRedirect, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
