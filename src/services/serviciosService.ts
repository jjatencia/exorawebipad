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

      // Mapear las variantes para convertir 'valor' a 'precio'
      const variantesNormalizadas = (response.data.variantes || []).map(variante => ({
        _id: variante._id,
        nombre: variante.nombre,
        precio: (variante as any).valor || 0 // Mapear 'valor' a 'precio'
      }));

      return variantesNormalizadas;
    } catch (error) {
      console.error('Error fetching variantes:', error);
      throw error;
    }
  }

  // Nuevo método para obtener variantes completas para la API de ventas
  static async getVariantesCompletas(empresa: string): Promise<any[]> {
    try {
      const response = await apiClient.post<VariantesResponse>('/variantes/empresa', { empresa });

      // Devolver las variantes con todos los campos originales de la API
      return (response.data.variantes || []).map(variante => ({
        _id: variante._id,
        empresa: (variante as any).empresa || empresa,
        nombre: variante.nombre,
        descripcion: (variante as any).descripcion || "",
        tiempo: (variante as any).tiempo || 0,
        valor: (variante as any).valor || 0,
        valorType: (variante as any).valorType || "money",
        servicios: (variante as any).servicios || [],
        productos: (variante as any).productos || [],
        deleted: (variante as any).deleted || false
      }));
    } catch (error) {
      console.error('Error fetching variantes completas:', error);
      throw error;
    }
  }

  // Método auxiliar para calcular el precio total con variantes
  static calcularPrecioTotal(servicio: Servicio, variantes: Variante[]): number {
    let precioTotal = servicio.precio;

    // Sumar precio de variantes si lo tienen
    variantes.forEach(variante => {
      precioTotal += variante.precio || 0;
    });

    return precioTotal;
  }
}