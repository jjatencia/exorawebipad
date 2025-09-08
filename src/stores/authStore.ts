import { create } from 'zustand';
import toast from 'react-hot-toast';
import { AuthState, User } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { authService } from '../services/auth.service';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      // Try real API first
      const response = await authService.login({ email, password });
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true
      });
      
      toast.success(`Bienvenido, ${response.user.name}`);
    } catch (error: any) {
      console.warn('API login failed, using mock authentication');
      
      // Fallback to mock authentication for development
      const mockUser = {
        id: 'mock-user-1',
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email,
        role: 'barbero'
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser));
      
      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true
      });
      
      toast.success(`Bienvenido, ${mockUser.name}! (Modo desarrollo)`);
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
    
    toast.success('Sesión cerrada correctamente');
  },

  checkAuth: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        set({
          user,
          token,
          isAuthenticated: true
        });
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    }
  }
}));