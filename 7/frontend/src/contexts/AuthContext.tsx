import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, LoginData, RegisterData, AuthResponse } from '../types';
import { authApi, getToken, setToken, removeToken } from '../api/habitApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.success) {
        setUser(response.user);
      } else {
        removeToken();
        setUser(null);
      }
    } catch (error) {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await authApi.login(data);
    if (response.success && response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await authApi.register(data);
    if (response.success && response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getToken(),
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
