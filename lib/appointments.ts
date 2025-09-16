import { AuthService } from './auth';

export interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  deleted: boolean;
  saldoMonedero: number;
  delayType: string;
  delay: string;
  comentarios: string[];
}

export interface Sucursal {
  _id: string;
  nombre: string;
  direccion: string;
  poblacion: string;
  horarioTxt: string[];
  deleted: boolean;
}

export interface Profesional {
  _id: string;
  nombre: string;
  color: string;
  deleted: boolean;
  delayType: string;
  delay: string;
  valoracion: string;
}

export interface Servicio {
  _id: string;
  nombre: string;
  duracion: string;
  precio: number;
  deleted: boolean;
  variantes: string[];
}

export interface Variante {
  _id: string;
  nombre: string;
}

export interface Recordatorios {
  m1: boolean;
  m2: boolean;
  m3: boolean;
  m4: boolean;
  m5: boolean;
  m6: boolean;
}

export interface Appointment {
  recordatorios: Recordatorios;
  _id: string;
  usuario: Usuario;
  usuarioDelayType: string;
  usuarioDelay: string;
  empresa: string;
  sucursal: Sucursal;
  profesional: Profesional;
  profesionalDelayType: string;
  profesionalDelay: string;
  fecha: string;
  importe: number;
  descuentos: any[];
  promocion: any[];
  servicios: Servicio[];
  comentarios: string[];
  tieneHijas: boolean;
  duracion: string;
  pagada: boolean;
  prepago: boolean;
  variantes: Variante[];
  complementarios: any[];
  isProfesionalRandom: boolean;
  estado: string;
  deleted: boolean;
  metodoPago: string;
  creacion: string;
  modificacion: string;
  venta?: string;
}

export interface AppointmentsResponse {
  ok: boolean;
  citas: Appointment[];
  fecha: string;
  profesional: string;
}

export interface FetchAppointmentsParams {
  empresa: string;
  fecha: string;
}

export class AppointmentsService {
  private static readonly API_BASE = 'https://api.exora.app/api';

  static async fetchAppointments(params: FetchAppointmentsParams): Promise<AppointmentsResponse> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('Token de autenticación requerido');
    }

    try {
      const response = await fetch(`${this.API_BASE}/citas/dia/profesional`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': token,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }
}