import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../components/api/supabaseClient';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setAuthError(null);
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthError(null);
    } catch (error) {
      console.error('Error checking user:', error);
      setAuthError({ type: 'auth_error', message: error.message });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) {
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // ✅ حذف الـ token يدوياً أولاً (اسم الـ key من Supabase)
      localStorage.removeItem('sb-tugrpzywepplllhmsxbk-auth-token');
      localStorage.removeItem('housy24-auth-token');
      sessionStorage.clear();
      
      // تسجيل خروج من Supabase
      await supabase.auth.signOut();
      
      // امسح الـ state
      setUser(null);
      
      // ✅ إعادة التحميل الكاملة (replace بدلاً من href)
      window.location.replace('/');
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      // حتى لو حدث خطأ، امسح كل شيء وأعد التحميل
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/');
      return { error };
    }
  };

  const value = {
    user,
    loading: isLoadingAuth,
    isLoadingAuth,
    isLoadingPublicSettings: false,
    authError,
    isAuthenticated: !!user,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    navigateToLogin: () => {}
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}