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
      // ✅ تجاهل التحديث إذا كان event هو SIGNED_OUT
      if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoadingAuth(false);
        return;
      }

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
      // ✅ تسجيل خروج من Supabase أولاً (هذا يُطلق SIGNED_OUT event)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
      }

      // ✅ امسح كل storage يدوياً
      localStorage.clear();
      sessionStorage.clear();
      
      // ✅ امسح الـ state
      setUser(null);
      
      // ✅ إعادة توجيه فورية بدون delay
      window.location.href = '/';
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      // حتى لو حدث خطأ، امسح كل شيء
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      window.location.href = '/';
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