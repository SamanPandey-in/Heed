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

  // On mount: verify session via HttpOnly refresh cookie
  useEffect(() => {
    if (hasRestoredSession.current) return;
    hasRestoredSession.current = true;

    const restoreSession = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
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
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async ({ fullName, username, email, password }) => {
    try {
      const { data } = await api.post('/auth/register', { fullName, username, email, password });
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      return { success: true, user: data.user };
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