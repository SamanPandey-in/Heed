import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import api from '../lib/api';
import { store } from '../store';
import { apiSlice } from '../store/slices/apiSlice';
import { clearUser } from '../store/slices/userSlice';
import { resetTeamsState } from '../store/slices/teamsSlice';
import { resetProjectsState } from '../store/slices/projectsSlice';
import { resetTasksState } from '../store/slices/tasksSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const hasRestoredSession = useRef(false);

  // On mount: verify session via HttpOnly refresh cookie and get a fresh access token
  useEffect(() => {
    if (hasRestoredSession.current) return;
    hasRestoredSession.current = true;

    const restoreSession = async () => {
      try {
        // Always get a fresh access token on mount — the stored one may be expired (15 min TTL).
        // /auth/refresh validates the HttpOnly refresh cookie (7d TTL) and returns a new access token.
        const { data: refreshData } = await api.post('/auth/refresh');
        localStorage.setItem('accessToken', refreshData.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${refreshData.accessToken}`;

        // Now fetch the full user profile with the fresh token.
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        // Refresh token absent or expired → no session, send to login.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
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
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
    store.dispatch(clearUser());
    store.dispatch(resetTeamsState());
    store.dispatch(resetProjectsState());
    store.dispatch(resetTasksState());
    store.dispatch(apiSlice.util.resetApiState());
    setUser(null);
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
      return { success: true, code: data.code, message: data.message };
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

  const refreshAccessToken = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      return data.accessToken;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
      refreshAccessToken,
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