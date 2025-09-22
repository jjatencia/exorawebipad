import { apiClient } from './api';
import { Servicio, Variante } from '../types';

export interface ServiciosResponse {
  ok: boolean;
  servicios: Servicio[];
}

export interface VariantesResponse {
  ok: boolean;
  variantes: Variante[];
}

export class ServiciosService {
  static async getServicios(empresa: string): Promise<Servicio[]> {
    try {
      const response = await apiClient.post<ServiciosResponse>('/servicios/empresa', { empresa });
      return response.data.servicios || [];
    } catch (error) {
      console.error('Error fetching servicios:', error);
      throw error;
    }
  }

  static async getVariantes(empresa: string): Promise<Variante[]> {
    try {
      const response = await apiClient.post<VariantesResponse>('/variantes/empresa', { empresa });
      return response.data.variantes || [];
    } catch (error) {
      console.error('Error fetching variantes:', error);
      throw error;
    }
  }

  // Método auxiliar para calcular el precio total con variantes
  static calcularPrecioTotal(servicio: Servicio, variantes: Variante[]): number {
    let precioTotal = servicio.precio;

    // Aquí asumo que las variantes pueden tener precio adicional
    // Si no tienen precio, solo devuelve el precio base del servicio
    variantes.forEach(_variante => {
      // Si las variantes tienen precio, se sumaría aquí
      // precioTotal += variante.precio || 0;
    });

    return precioTotal;
  }
}