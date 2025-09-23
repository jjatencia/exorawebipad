export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.exora.app/api';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'exora_auth_token',
  USER_DATA: 'exora_user_data',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  HOME: '/',
} as const;