import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storageService';

export const ADMIN_EMAIL = 'ashleyghose64@gmail.com';
export const ADMIN_PASSWORD = 'Ashley@$#1995';

export interface User {
  email: string;
  phone?: string;
  name?: string;
  role?: 'admin' | 'candidate';
  grade?: string;
  board?: string;
  school?: string;
  registeredAt?: number;
  trialEndsAt?: number;
  isPaidPro?: boolean;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  authTab: 'login' | 'register';
  setAuthTab: (tab: 'login' | 'register') => void;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  handleLogoClick: () => void;
  loginAdminWithPassword: (email: string, password: string) => { success: boolean; message: string };
  login: (email: string, name?: string) => void;
  register: (data: { name: string; email: string; phone: string; password?: string; grade?: string; board?: string; school?: string }) => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string };
  resetPassword: (email: string, newPass: string) => boolean;
  updateProfile: (data: { name?: string; grade?: string; board?: string; school?: string }) => void;
  upgradeToPro: () => void;
  loginWithRedirect: (customEmail?: string) => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = 'learnready_auth_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Triple-click detection
  const clickHistoryRef = useRef<number[]>([]);

  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);

  const handleLogoClick = () => {
    const now = Date.now();
    // Keep clicks from the last 1500ms
    const recent = [...clickHistoryRef.current.filter(t => now - t < 1500), now];
    clickHistoryRef.current = recent;
    if (recent.length >= 3) {
      clickHistoryRef.current = [];
      openAdminModal();
    }
  };

  const login = (email: string, name?: string) => {
    const isTargetAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const existing = StorageService.findUserByEmail(email);
    const now = Date.now();

    const sessionUser: User = {
      email: email.trim(),
      phone: existing?.phone,
      name: name || existing?.name || (isTargetAdmin ? 'Ashley Ghose' : email.split('@')[0]),
      role: isTargetAdmin ? 'admin' : 'candidate',
      grade: existing?.grade,
      board: existing?.board,
      school: existing?.school,
      registeredAt: existing?.registeredAt || now,
      trialEndsAt: existing?.trialEndsAt || (now + 7 * 24 * 60 * 60 * 1000),
      isPaidPro: existing?.isPaidPro || false,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const register = (data: { name: string; email: string; phone: string; password?: string; grade?: string; board?: string; school?: string }) => {
    const isTargetAdmin = data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const now = Date.now();
    const registeredAt = now;
    const trialEndsAt = now + 7 * 24 * 60 * 60 * 1000;

    StorageService.saveUserAccount({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: isTargetAdmin ? 'admin' : 'candidate',
      grade: data.grade,
      board: data.board,
      school: data.school,
      registeredAt,
      trialEndsAt,
      isPaidPro: false,
    });

    const sessionUser: User = {
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: isTargetAdmin ? 'admin' : 'candidate',
      grade: data.grade,
      board: data.board,
      school: data.school,
      registeredAt,
      trialEndsAt,
      isPaidPro: false,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const requestPasswordReset = (email: string) => {
    return StorageService.createPasswordResetRequest(email);
  };

  const resetPassword = (email: string, newPass: string) => {
    return StorageService.resetUserPassword(email, newPass);
  };

  const updateProfile = (data: { name?: string; grade?: string; board?: string; school?: string }) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      name: data.name !== undefined ? data.name : user.name,
      grade: data.grade !== undefined ? data.grade : user.grade,
      board: data.board !== undefined ? data.board : user.board,
      school: data.school !== undefined ? data.school : user.school,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
    StorageService.saveUserAccount(updatedUser as any);
  };

  const upgradeToPro = () => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      isPaidPro: true,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
    StorageService.saveUserAccount(updatedUser as any);
  };

  const loginAdminWithPassword = (email: string, passwordInput: string) => {
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: `Access denied. Administration portal is reserved exclusively for ${ADMIN_EMAIL}.`,
      };
    }
    if (passwordInput !== ADMIN_PASSWORD) {
      return {
        success: false,
        message: 'Invalid administrator password. Access denied.',
      };
    }

    login(ADMIN_EMAIL, 'Ashley Ghose');
    return {
      success: true,
      message: 'Admin authorization granted.',
    };
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.grade) {
          parsed.grade = parsed.grade.replace(/\s*\(Current\)/gi, '').trim();
        }
        setUser(parsed);
      }
    } catch (e) {
      console.error('Failed to parse auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithRedirect = (emailToUse?: string) => {
    const targetEmail = emailToUse || ADMIN_EMAIL;
    login(targetEmail);
  };

  const loginAsAdmin = () => {
    login(ADMIN_EMAIL, 'Ashley Ghose');
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authTab,
        setAuthTab,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
        handleLogoClick,
        loginAdminWithPassword,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        upgradeToPro,
        loginWithRedirect,
        loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
