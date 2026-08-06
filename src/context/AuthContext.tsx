import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  UserRole,
  AuthState,
  LoginCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload
} from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ message: string }>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'sims_access_token';
const REFRESH_KEY = 'sims_refresh_token';
const USER_KEY = 'sims_user_profile';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Session Rehydration on app load
  const rehydrateSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_KEY);
    const storedUserRaw = localStorage.getItem(USER_KEY);

    if (!storedToken && !storedRefresh) {
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      return;
    }

    try {
      // Try verifying current access token with /me endpoint
      const res = await authApi.getMe(storedToken);
      if (res.success && res.data) {
        setState({
          user: res.data as unknown as User,
          accessToken: storedToken,
          refreshToken: storedRefresh,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        return;
      }
    } catch {
      // Access token expired, attempt refresh
      if (storedRefresh) {
        try {
          const refreshRes = await authApi.refreshToken(storedRefresh);
          if (refreshRes.success && refreshRes.data) {
            const { accessToken, refreshToken, user } = refreshRes.data;
            localStorage.setItem(TOKEN_KEY, accessToken);
            localStorage.setItem(REFRESH_KEY, refreshToken);
            localStorage.setItem(USER_KEY, JSON.stringify(user));

            setState({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return;
          }
        } catch {
          // Both tokens invalid, clear local session
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
    }

    // Fallback: If cached user profile exists, use as graceful offline session
    if (storedUserRaw) {
      try {
        const cachedUser = JSON.parse(storedUserRaw);
        setState({
          user: cachedUser,
          accessToken: storedToken,
          refreshToken: storedRefresh,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return;
      } catch {
        // Ignore parse error
      }
    }

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }, []);

  useEffect(() => {
    rehydrateSession();
  }, [rehydrateSession]);

  // Login handler
  const login = async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.data) {
        const { accessToken, refreshToken, user } = res.data;

        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_KEY, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Login failed. Please check your credentials.'
      }));
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await authApi.logout(state.accessToken);
    } catch {
      // Silent error on logout
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);

      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  };

  // Forgot Password handler
  const forgotPassword = async (email: string) => {
    return await authApi.forgotPassword({ email });
  };

  // Reset Password handler
  const resetPassword = async (token: string, newPassword: string) => {
    return await authApi.resetPassword({ token, newPassword });
  };

  // Change Password handler
  const changePassword = async (currentPassword: string, newPassword: string) => {
    return await authApi.changePassword({ currentPassword, newPassword }, state.accessToken);
  };

  const hasRole = (role: UserRole) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]) => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
        hasRole,
        hasAnyRole,
        clearError
      }}
    >
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
