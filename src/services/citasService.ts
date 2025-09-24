import { apiClient } from './api';

export interface UpdateCitaEstadoRequest {
  empresa: string;
  estadoCita: string;
  _id?: string; // Usar _id en lugar de citaId
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
  static async marcarNoPresentado(citaId: string, empresaId: string): Promise<UpdateCitaEstadoResponse> {
    try {
      const payload: UpdateCitaEstadoRequest = {
        empresa: empresaId,
        estadoCita: 'No presentado',
        _id: citaId
      };

      const response = await apiClient.put<UpdateCitaEstadoResponse>(
        `/citas`,
        payload
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
    citaId: string,
    empresaId: string,
    estadoCita: string
  ): Promise<UpdateCitaEstadoResponse> {
    try {
      const payload: UpdateCitaEstadoRequest = {
        empresa: empresaId,
        estadoCita: estadoCita,
        _id: citaId
      };

      const response = await apiClient.put<UpdateCitaEstadoResponse>(
        `/citas`,
        payload
      );

      return response.data;
    } catch (error) {
      console.error('Error actualizando estado de cita:', error);
      throw error;
    }
  }
}