export const environment = {
  production: false,
  development: true,
  apiBaseUrl: (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.exora.app/api',
  enableDebugLogs: (import.meta as any).env?.DEV,
  enableMockData: (import.meta as any).env?.VITE_ENABLE_MOCK_DATA === 'true',
  version: (import.meta as any).env?.VITE_APP_VERSION || '1.0.0'
};

export const API_BASE_URL = environment.apiBaseUrl;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'exora_auth_token',
  USER_DATA: 'exora_user_data',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  HOME: '/',
} as const;

export const isDevelopment = () => environment.development;
export const isProduction = () => environment.production;
export const shouldUseMockData = () => environment.enableMockData;