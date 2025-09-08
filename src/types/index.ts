export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Appointment {
  id: string;
  cliente: string;
  telefono: string;
  servicio: string;
  variante: string;
  sucursal: string;
  fecha: string;
  hora: string;
  descuentos: string;
  comentarios?: string;
  apiDate?: string; // For filtering mock data
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export interface AppointmentState {
  appointments: Appointment[];
  currentDate: string;
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  fetchAppointments: (date: string) => Promise<void>;
  setCurrentIndex: (index: number) => void;
  setCurrentDate: (date: string) => void;
  clearError: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}