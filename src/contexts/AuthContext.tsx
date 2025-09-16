'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../../lib/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  _id: string;
  nombre: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = AuthService.getToken();
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);

      if (response.ok && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.msg || 'Error de autenticación'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}