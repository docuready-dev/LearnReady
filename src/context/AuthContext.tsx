import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storageService';

export const ADMIN_EMAIL = 'ashleyghose64@gmail.com';

export interface User {
  email: string;
  phone?: string;
  name?: string;
  role?: 'admin' | 'candidate';
  grade?: string;
  board?: string;
  school?: string;
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
  sendAdminMagicLink: (email: string) => { success: boolean; message: string; magicUrl?: string; token?: string };
  verifyMagicToken: (token: string, email: string) => boolean;
  login: (email: string, name?: string) => void;
  register: (data: { name: string; email: string; phone?: string; grade?: string; board?: string; school?: string }) => void;
  loginWithRedirect: (customEmail?: string) => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = 'learnready_auth_session';
const MAGIC_STORAGE_KEY = 'learnready_admin_magic_token';

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

    const sessionUser: User = {
      email: email.trim(),
      name: name || existing?.name || (isTargetAdmin ? 'Ashley Ghose' : email.split('@')[0]),
      role: isTargetAdmin ? 'admin' : 'candidate',
      grade: existing?.grade,
      board: existing?.board,
      school: existing?.school,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const register = (data: { name: string; email: string; phone?: string; grade?: string; board?: string; school?: string }) => {
    const isTargetAdmin = data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    StorageService.saveUserAccount({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: isTargetAdmin ? 'admin' : 'candidate',
      grade: data.grade,
      board: data.board,
      school: data.school,
    });

    const sessionUser: User = {
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: isTargetAdmin ? 'admin' : 'candidate',
      grade: data.grade,
      board: data.board,
      school: data.school,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const sendAdminMagicLink = (email: string) => {
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: `Unauthorized email address. The administration gateway is exclusively reserved for ${ADMIN_EMAIL}.`,
      };
    }

    const token = btoa(Date.now() + ':' + Math.random().toString(36).substring(2, 12));
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    localStorage.setItem(MAGIC_STORAGE_KEY, JSON.stringify({ token, email: ADMIN_EMAIL, expiresAt }));

    const baseUrl = window.location.origin + window.location.pathname;
    const magicUrl = `${baseUrl}#magic_token=${encodeURIComponent(token)}&email=${encodeURIComponent(ADMIN_EMAIL)}`;

    // Trigger real mailto intent
    try {
      const subject = encodeURIComponent('LearnReady Admin — One-Time Magic Login Link');
      const body = encodeURIComponent(
        `Hello Ashley,\n\nHere is your secure, one-time authentication link to access the LearnReady Admin Console:\n\n${magicUrl}\n\nThis link is valid for 15 minutes.\n\nLearnReady Security`
      );
      window.open(`mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`, '_blank');
    } catch {}

    return {
      success: true,
      message: `Magic Link dispatched to ${ADMIN_EMAIL}`,
      magicUrl,
      token,
    };
  };

  const verifyMagicToken = (token: string, email: string): boolean => {
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return false;
    try {
      const storedStr = localStorage.getItem(MAGIC_STORAGE_KEY);
      if (!storedStr) return false;
      const stored = JSON.parse(storedStr);
      if (stored.token === token && stored.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        if (Date.now() > stored.expiresAt) {
          localStorage.removeItem(MAGIC_STORAGE_KEY);
          return false;
        }
        localStorage.removeItem(MAGIC_STORAGE_KEY);
        login(ADMIN_EMAIL, 'Ashley Ghose');
        return true;
      }
    } catch {}
    return false;
  };

  // URL Magic link listener on startup and hash change
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

    function checkUrlForMagicLink() {
      const hash = window.location.hash;
      const search = window.location.search;
      const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : search);
      const token = params.get('magic_token');
      const email = params.get('email');

      if (token && email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        if (verifyMagicToken(token, email)) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    }

    checkUrlForMagicLink();
    window.addEventListener('hashchange', checkUrlForMagicLink);
    return () => window.removeEventListener('hashchange', checkUrlForMagicLink);
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
        sendAdminMagicLink,
        verifyMagicToken,
        login,
        register,
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
