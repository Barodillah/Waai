import { Routes, Route } from 'react-router-dom';
import MainLayout from './pages/MainLayout';
import EmptyChat from './pages/EmptyChat';
import ActiveChat from './pages/ActiveChat';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import ExplorePage from './pages/ExplorePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  const token = localStorage.getItem('waai_auth_token');
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#008069] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!token || (!loading && !user)) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        {/* Render EmptyChat by default (for desktop view) */}
        <Route index element={<EmptyChat />} />
        {/* Render ActiveChat when a session is selected */}
        <Route path="chat/:sessionId" element={<ActiveChat />} />
      </Route>
    </Routes>
  );
}

export default App;
