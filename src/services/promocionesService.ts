import { apiClient } from './api';

export interface Promocion {
  _id: string;
  titulo?: string;
  descripcion?: string;
  porcentaje?: number | null;
  cifra?: number;
  tipo?: string; // 'descuento'
  destino?: string; // 'servicio'
  activo?: boolean;
  empresa?: string;
  condiciones?: string;
  servicios?: string[];
  sucursales?: string[];
  profesionales?: string[];
  [key: string]: any;
}

export class PromocionesService {
  /**
   * Obtiene las promociones de una empresa específica
   * Este es el único endpoint que funciona correctamente
   */
  static async getPromocionesEmpresa(empresaId: string): Promise<Promocion[]> {
    try {
      const response = await apiClient.post('/promociones/empresa', { empresa: empresaId });
      const promociones = response.data.promociones || response.data;

      // Asegurar que las promociones tengan los campos requeridos
      return Array.isArray(promociones) ? promociones : [];
    } catch (error) {
      console.error('Error obteniendo promociones por empresa:', error);
      return [];
    }
  }

  /**
   * Busca una promoción específica por ID dentro de las promociones de la empresa
   */
  static async getPromocionById(promocionId: string, empresaId: string): Promise<Promocion | null> {
    try {
      const promociones = await this.getPromocionesEmpresa(empresaId);
      return promociones.find(p => p._id === promocionId) || null;
    } catch (error) {
      console.error('Error buscando promoción por ID:', error);
      return null;
    }
  }
}