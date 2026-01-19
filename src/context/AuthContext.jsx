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
    let mounted = true;

    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(data.session?.user ?? null);
        setAuthError(null);
      } catch (error) {
        if (!mounted) return;
        setUser(null);
        setAuthError(error);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error);
        return { data: null, error };
      }

      setAuthError(null);
      return { data, error: null };
    } catch (error) {
      setAuthError(error);
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setAuthError(error);
        return { data: null, error };
      }

      setAuthError(null);
      return { data, error: null };
    } catch (error) {
      setAuthError(error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error);
        return { data: null, error };
      }

      setAuthError(null);
      return { data, error: null };
    } catch (error) {
      setAuthError(error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthError(error);
        return { error };
      }

      // مسح البيانات المحلية
      localStorage.removeItem('sb-auth-token');
      sessionStorage.clear();

      setUser(null);
      setAuthError(null);

      // الانتقال لصفحة تسجيل الدخول
      window.location.href = '/login';

      return { error: null };
    } catch (error) {
      setAuthError(error);
      return { error };
    }
  };

  const value = {
    user,
    loading: isLoadingAuth,
    isLoadingAuth,
    authError,
    isAuthenticated: !!user,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}