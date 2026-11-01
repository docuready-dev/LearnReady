import { AuthProvider } from './context/AuthContext';
import { ExamProvider, useExam } from './context/ExamContext';
import LandingPage from './pages/LandingPage';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminPasswordModal from './components/AdminPasswordModal';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { page } = useExam();

  return (
    <>
      {page === 'exam' && <ExamPage />}
      {page === 'results' && <ResultsPage />}
      {page === 'admin' && <AdminPage />}
      {page === 'login' && <LoginPage />}
      {page === 'profile' && <ProfilePage />}
      {page === 'landing' && <LandingPage />}
      <AdminPasswordModal />
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
