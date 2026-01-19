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
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
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

  const checkUser = async () => {
    setIsLoadingAuth(true);
    try {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setAuthError(null);
      return data.session?.user ?? null;
    } catch (error) {
      setUser(null);
      setAuthError(error);
      return null;
    } finally {
      setIsLoadingAuth(false);
    }
  };

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
    setIsLoadingAuth(true);
    try {
      const { error } = await supabase.auth.signOut();

      localStorage.removeItem('sb-auth-token');
      sessionStorage.clear();

      setUser(null);
      setAuthError(null);

      return { error };
    } catch (error) {
      setUser(null);
      setAuthError(error);
      return { error };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const value = {
    user,
    loading: isLoadingAuth,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    isAuthenticated: !!user,
    checkUser,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    navigateToLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoadingAuth && children}
    </AuthContext.Provider>
  );
}
