import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AuthCallback from '@/pages/AuthCallback';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// حماية الصفحات - للصفحات التي تحتاج تسجيل فقط
const ProtectedRoute = ({ children, currentPageName }) => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <LayoutWrapper currentPageName={currentPageName}>{children}</LayoutWrapper>;
};

// قائمة الصفحات التي تحتاج تسجيل دخول (عدّل حسب احتياجك)
const protectedPages = ['profile', 'settings', 'dashboard'];

const AuthenticatedApp = () => {
  const { user, isLoadingAuth } = useAuth();

  // عرض التحميل
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* صفحات Auth */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/Home" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/Home" replace /> : <Register />} 
      />
      
      {/* صفحة callback لـ OAuth */}
      <Route 
        path="/auth/callback" 
        element={<AuthCallback />} 
      />

      {/* الصفحة الرئيسية - مفتوحة للجميع */}
      <Route 
        path="/" 
        element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } 
      />

      {/* باقي الصفحات - حماية حسب القائمة */}
      {Object.entries(Pages).map(([path, Page]) => {
        const needsAuth = protectedPages.includes(path);
        
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              needsAuth ? (
                <ProtectedRoute currentPageName={path}>
                  <Page />
                </ProtectedRoute>
              ) : (
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              )
            }
          />
        );
      })}

      {/* صفحة 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AuthProvider>
          <AuthenticatedApp />
          <Toaster />
          <VisualEditAgent />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App