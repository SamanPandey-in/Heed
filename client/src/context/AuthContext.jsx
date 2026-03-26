import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import api from '../lib/api';
import { store } from '../store';
import { apiSlice } from '../store/slices/apiSlice';
import { clearUser } from '../store/slices/userSlice';
import { resetTeamsState } from '../store/slices/teamsSlice';
import { resetProjectsState } from '../store/slices/projectsSlice';
import { resetTasksState } from '../store/slices/tasksSlice';

const AuthContext = createContext(null);
const AUTH_SYNC_KEY = 'relayops:auth-sync';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const hasRestoredSession = useRef(false);
  const sessionValidationRef = useRef(null);

  const resetAppState = useCallback(() => {
    store.dispatch(clearUser());
    store.dispatch(resetTeamsState());
    store.dispatch(resetProjectsState());
    store.dispatch(resetTasksState());
    store.dispatch(apiSlice.util.resetApiState());
  }, []);

  const broadcastAuthState = useCallback((type) => {
    try {
      window.localStorage.setItem(
        AUTH_SYNC_KEY,
        JSON.stringify({ type, ts: Date.now() }),
      );
    } catch {
      // Ignore storage failures so auth flow still works in constrained browsers.
    }
  }, []);

  const clearAuthState = useCallback(({ broadcast = false } = {}) => {
    resetAppState();
    setUser(null);
    setLoading(false);
    setAuthChecked(true);

    if (broadcast) {
      broadcastAuthState('logout');
    }
  }, [broadcastAuthState, resetAppState]);

  const validateSession = useCallback(async () => {
    if (sessionValidationRef.current) {
      return sessionValidationRef.current;
    }

    sessionValidationRef.current = (async () => {
      try {
        const { data } = await api.get('/auth/me');
        const nextUser = data?.user || null;
        setUser(nextUser);
        return nextUser;
      } catch {
        setUser(null);
        return null;
      } finally {
        setLoading(false);
        setAuthChecked(true);
        sessionValidationRef.current = null;
      }
    })();

    return sessionValidationRef.current;
  }, []);

  // On mount: verify the existing HttpOnly session cookie without extending it.
  useEffect(() => {
    if (hasRestoredSession.current) return;
    hasRestoredSession.current = true;

    validateSession();
  }, [validateSession]);

  useEffect(() => {
    const handleUnauthorized = async () => {
      if (!authChecked) return;

      const restoredUser = await validateSession();
      if (!restoredUser) {
        clearAuthState({ broadcast: true });
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [authChecked, clearAuthState, validateSession]);

  useEffect(() => {
    const handleStorage = async (event) => {
      if (event.key !== AUTH_SYNC_KEY || !event.newValue) return;

      try {
        const payload = JSON.parse(event.newValue);

        if (payload?.type === 'logout') {
          clearAuthState();
          return;
        }

        if (payload?.type === 'login') {
          setLoading(true);
          await validateSession();
        }
      } catch {
        // Ignore malformed cross-tab messages.
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [clearAuthState, validateSession]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
      setLoading(false);
      setAuthChecked(true);
      broadcastAuthState('login');
      return { success: true, user: data.user };
    } catch (err) {
      const data = err.response?.data || {};
      return {
        success: false,
        error: data.message || 'Login failed',
        code: data.code || null,
        email: data.email || null,
      };
    }
  };

  const signup = async ({ fullName, username, email, password }) => {
    try {
      const { data } = await api.post('/auth/register', { fullName, username, email, password });
      return { success: true, email: data.email, message: data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearAuthState({ broadcast: true });
    return { success: true };
  };

  const forgotPassword = async (payload) => {
    const email = typeof payload === 'string' ? payload : payload?.email;
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Request failed' };
    }
  };

  const resetPassword = async ({ token, newPassword }) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Reset failed' };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const { data } = await api.get(`/auth/verify-email?token=${token}`);
      return { success: true, code: data.code, message: data.message, email: data.email || null };
    } catch (err) {
      return {
        success: false,
        code: err.response?.data?.code || 'ERROR',
        error: err.response?.data?.message || 'Verification failed',
      };
    }
  };

  const resendVerification = async (email) => {
    try {
      await api.post('/auth/resend-verification', { email });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to resend' };
    }
  };

  const revalidateSession = useCallback(async () => {
    const nextUser = await validateSession();
    return nextUser ? true : null;
  }, [validateSession]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authChecked,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
      revalidateSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
