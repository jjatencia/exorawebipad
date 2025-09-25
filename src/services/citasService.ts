import { apiClient } from './api';
import { Appointment } from '../types';

export interface UpdateCitaEstadoRequest {
  empresa: string;
  estadoCita: string;
}

export interface UpdateCitaEstadoResponse {
  ok: boolean;
  msg: string;
  cita: {
    recordatorios: {
      m1: boolean;
      m2: boolean;
      m3: boolean;
      m4: boolean;
      m5: boolean;
      m6: boolean;
    };
    _id: string;
    usuario: {
      _id: string;
      nombre: string;
      email: string;
      telefono: string;
      deleted: boolean;
    };
    usuarioDelayType: string;
    usuarioDelay: string;
    empresa: string;
    sucursal: string;
    profesional: string;
    profesionalDelayType: string;
    profesionalDelay: string;
    fecha: string;
    importe: number;
    descuentos: any[];
    promocion: any[];
    servicios: string[];
    comentarios: any[];
    tieneHijas: boolean;
    duracion: string;
    pagada: boolean;
    prepago: boolean;
    variantes: any[];
    complementarios: any[];
    isProfesionalRandom: boolean;
    estado: string;
    deleted: boolean;
    metodoPago: string;
    creacion: string;
    modificacion: string;
  };
}

export class CitasService {
  /**
   * Marca una cita como "No presentado"
   */
  static async marcarNoPresentado(appointment: Appointment): Promise<UpdateCitaEstadoResponse> {
    try {
      const payload: UpdateCitaEstadoRequest = {
        empresa: appointment.empresa,
        estadoCita: 'No presentado'
      };

      const response = await apiClient.delete<UpdateCitaEstadoResponse>(
        `/citas/${appointment._id}`,
        { data: payload }
      );

      return response.data;
    } catch (error) {
      console.error('Error marcando cita como no presentado:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una cita
   */
  static async updateEstadoCita(
    appointment: Appointment,
    estadoCita: string
  ): Promise<UpdateCitaEstadoResponse> {
    try {
      const payload: UpdateCitaEstadoRequest = {
        empresa: appointment.empresa,
        estadoCita: estadoCita
      };

      const response = await apiClient.delete<UpdateCitaEstadoResponse>(
        `/citas/${appointment._id}`,
        { data: payload }
      );

      return response.data;
    } catch (error) {
      console.error('Error actualizando estado de cita:', error);
      throw error;
    }
  }
}