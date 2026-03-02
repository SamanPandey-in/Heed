// ============================================================================
// AUTH CONTEXT - Unified authentication using RTK Query
// ============================================================================

import { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  apiSlice,
} from '../store/slices/apiSlice';
import { disconnectSocket } from '../hooks/useSocket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  // Get token from localStorage on mount
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // RTK Query hooks
  const {
    data: user,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileQuery(undefined, {
    skip: !storedToken,
  });

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [updateProfileMutation] = useUpdateProfileMutation();
  const [requestPasswordResetMutation] = useRequestPasswordResetMutation();
  const [resetPasswordMutation] = useResetPasswordMutation();

  const isAuthenticated = !!user && !profileError;
  const loading = profileLoading;

  // Set up token change listener
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Token was removed, refetch to clear user
        refetchProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refetchProfile]);

  const login = async (email, password) => {
    try {
      const result = await loginMutation({ email, password }).unwrap();

      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
        // Refetch profile after login
        await refetchProfile();
        return { success: true, user: result.user };
      }

      return { success: false, error: 'Login failed - no token returned' };
    } catch (error) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Login failed'
      };
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const result = await registerMutation({ name, email, password }).unwrap();

      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
        // Refetch profile after registration
        await refetchProfile();
        return { success: true, user: result.user };
      }

      return { success: true, user: result };
    } catch (error) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Continue with logout even if API fails
      console.error('Logout API error:', error);
    }

    // Disconnect socket
    disconnectSocket();

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Clear RTK Query cache
    dispatch(apiSlice.util.resetApiState());
  };

  const updateProfile = async (updates) => {
    try {
      const result = await updateProfileMutation(updates).unwrap();
      return { success: true, user: result };
    } catch (error) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Update failed'
      };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await requestPasswordResetMutation(email).unwrap();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Password reset request failed'
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await resetPasswordMutation({ token, password }).unwrap();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Password reset failed'
      };
    }
  };

  // OAuth sign-in (placeholder - would redirect to OAuth provider)
  const signInWithOAuth = useCallback((provider) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${API_BASE_URL}/auth/oauth/${provider}`;
    return { success: true };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refetchProfile,
    requestPasswordReset,
    resetPassword,
    signInWithOAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
