import { apiClient } from './api';
import { Appointment } from '../types';

export interface FetchAppointmentsParams {
  empresa: string;
  fecha: string;
  profesional?: string;
}

export interface AppointmentsResponse {
  ok: boolean;
  citas: Appointment[];
  fecha: string;
  profesional: string;
}

export class AppointmentsService {
  static async fetchAppointments(params: FetchAppointmentsParams): Promise<AppointmentsResponse> {
    try {
      const response = await apiClient.post<AppointmentsResponse>('/citas/dia/profesional', params);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }
}
