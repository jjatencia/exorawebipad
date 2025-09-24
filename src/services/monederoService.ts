import { apiClient } from './api';

export interface MovimientoSaldoRequest {
  empresa: string;
  monto: number; // Monto negativo para descontar
  citaId: string;
  metodoPago: string;
}

export interface MovimientoSaldoResponse {
  ok: boolean;
  code: number;
  msg: string;
  clienteSaldoCreado: {
    usuario: string;
    empresa: string;
    fecha: string;
    monto: number;
    updatedbyadmin: boolean;
    cita: string;
    creacion: string;
    modificacion: string;
    _id: string;
  };
  ventaGuardada: {
    usuario: string;
    empresa: string;
    sucursal: string;
    profesional: string;
    fechaCita: string;
    importe: number;
    descuentos: any[];
    promocion: any[];
    servicios: any[];
    variantes: any[];
    productos: any[];
    metodoPago: string;
    fechaVenta: string;
    creacion: string;
    modificacion: string;
    cita: string;
    _id: string;
  };
}

export interface UsuarioActualizadoRequest {
  usuario: string;
  empresa: string;
}

export interface UsuarioActualizadoResponse {
  ok: boolean;
  usuario: {
    _id: string;
    nombre: string;
    saldoMonedero: number;
    [key: string]: any;
  };
}

export interface VentaResponse {
  ok: boolean;
  venta: {
    _id: string;
    usuario: {
      _id: string;
      nombre: string;
      email: string;
      saldoMonedero: number;
    };
    [key: string]: any;
  };
}

export class MonederoService {
  /**
   * Verifica si el cliente tiene saldo suficiente
   */
  static tieneSaldoSuficiente(saldoMonedero: number, importe: number): boolean {
    return saldoMonedero >= importe;
  }

  /**
   * Procesa un pago completo con monedero siguiendo la secuencia de la API
   */
  static async procesarPagoMonedero(
    clienteId: string,
    empresaId: string,
    citaId: string,
    importe: number
  ): Promise<VentaResponse> {
    try {
      // 1. Crear movimiento de saldo (descontar del monedero)
      const movimientoResponse = await this.crearMovimientoSaldo(
        clienteId,
        empresaId,
        citaId,
        importe
      );

      if (!movimientoResponse.ok) {
        throw new Error('Error al crear movimiento de saldo');
      }

      const ventaId = movimientoResponse.ventaGuardada._id;

      // 2. Obtener datos actualizados del usuario
      await this.obtenerUsuarioActualizado(clienteId, empresaId);

      // 3. Obtener venta completa (primera llamada)
      const ventaResponse1 = await this.obtenerVenta(ventaId);

      // 4. Obtener venta completa (segunda llamada para confirmar)
      const ventaResponse2 = await this.obtenerVenta(ventaId);

      return ventaResponse2;
    } catch (error) {
      console.error('Error en procesarPagoMonedero:', error);
      throw error;
    }
  }

  /**
   * Crear movimiento de saldo negativo
   */
  private static async crearMovimientoSaldo(
    clienteId: string,
    empresaId: string,
    citaId: string,
    importe: number
  ): Promise<MovimientoSaldoResponse> {
    const payload: MovimientoSaldoRequest = {
      empresa: empresaId,
      monto: -importe, // Negativo para descontar
      citaId: citaId,
      metodoPago: 'Monedero'
    };

    const response = await apiClient.post<MovimientoSaldoResponse>(
      `/clientesaldo/nuevoclientesaldo/${clienteId}`,
      payload
    );

    return response.data;
  }

  /**
   * Obtener datos actualizados del usuario
   */
  private static async obtenerUsuarioActualizado(
    clienteId: string,
    empresaId: string
  ): Promise<UsuarioActualizadoResponse> {
    const payload: UsuarioActualizadoRequest = {
      usuario: clienteId,
      empresa: empresaId
    };

    const response = await apiClient.post<UsuarioActualizadoResponse>(
      '/usuarios/usuario',
      payload
    );

    return response.data;
  }

  /**
   * Obtener información de la venta
   */
  private static async obtenerVenta(ventaId: string): Promise<VentaResponse> {
    const response = await apiClient.get<VentaResponse>(`/ventas/${ventaId}`);
    return response.data;
  }
}