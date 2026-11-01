import { AuthProvider } from './context/AuthContext';
import { ExamProvider, useExam } from './context/ExamContext';
import LandingPage from './pages/LandingPage';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { page } = useExam();
  if (page === 'exam') return <ExamPage />;
  if (page === 'results') return <ResultsPage />;
  if (page === 'admin') return <AdminPage />;
  if (page === 'login') return <LoginPage />;
  return <LandingPage />;
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
