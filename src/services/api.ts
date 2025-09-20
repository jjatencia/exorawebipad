import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import { Appointment } from '../types';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers['x-token'] = token;
    }

    // Debug: log headers para ventas
    if (config.url?.includes('ventas')) {
      console.log('=== HEADERS FINALES ===');
      console.log('Headers enviados:', config.headers);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || error.response?.data?.msg || error.message || 'Error de conexión';

    if (error.response?.status === 401) {
      // Solo eliminar token si el error específicamente indica que el token es inválido/expirado
      // No eliminarlo por problemas de permisos específicos
      if (errorMessage.includes('token') && (errorMessage.includes('expirado') || errorMessage.includes('inválido') || errorMessage.includes('válido'))) {
        console.warn('Token realmente expirado/inválido - eliminando del localStorage');
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } else {
        console.warn('Error 401 pero token podría ser válido (problema de permisos):', errorMessage);
      }
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      authError: error.response?.status === 401
    });
  }
);

export const apiService = {
  async getAppointments(date: string, empresa: string, professional?: string): Promise<Appointment[]> {
    const requestBody: any = {
      fecha: date,
      empresa: empresa
    };

    if (professional) {
      requestBody.profesional = professional;
    }

    const response = await apiClient.post('/citas/dia/profesional', requestBody);
    return response.data;
  }
};