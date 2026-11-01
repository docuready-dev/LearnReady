import { useEffect } from 'react';
import { AuthProvider, useAuth, ADMIN_EMAIL } from './context/AuthContext';
import { ExamProvider, useExam } from './context/ExamContext';
import LandingPage from './pages/LandingPage';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminMagicModal from './components/AdminMagicModal';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { page, setPage } = useExam();
  const { user } = useAuth();

  useEffect(() => {
    // If authenticated via magic link or has admin role, allow automatic transition to admin if requested
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes('magic_token') || search.includes('magic_token')) {
      if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role === 'admin') {
        setPage('admin');
      }
    }
  }, [user, setPage]);

  return (
    <>
      {page === 'exam' && <ExamPage />}
      {page === 'results' && <ResultsPage />}
      {page === 'admin' && <AdminPage />}
      {page === 'login' && <LoginPage />}
      {page === 'profile' && <ProfilePage />}
      {page === 'landing' && <LandingPage />}
      <AdminMagicModal />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <AppContent />
        <Toaster />
      </ExamProvider>
    </AuthProvider>
  );
}
