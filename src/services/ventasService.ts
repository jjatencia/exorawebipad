import { Appointment } from '../types';

export interface VentaData {
  usuario: string;
  empresa: string;
  sucursal: string;
  profesional: string;
  fechaCita: string;
  importe: number;
  promocion: any[];
  servicios: Array<{
    _id: string;
    nombre: string;
    precio: number;
  }>;
  variantes: Array<{
    _id: string;
    nombre: string;
  }>;
  productos: any[];
  metodoPago: string;
  cita: string;
  descuentos: any[];
  fechaVenta: string;
}

// Token validation helper
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? Date.now() >= payload.exp * 1000 : false;
  } catch {
    return true;
  }
};

export const createVenta = async (appointment: Appointment, metodoPago: string): Promise<any> => {
  // Use development token if available, otherwise fallback to localStorage
  const devToken = import.meta.env.VITE_DEV_BUSINESS_TOKEN;
  const token = devToken || localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'exora_auth_token');

  if (!token) {
    throw new Error('No hay token de autenticación válido');
  }

  // Validate token if not in development mode
  if (!devToken && isTokenExpired(token)) {
    throw new Error('Token de autenticación expirado. Por favor, inicia sesión nuevamente.');
  }

  // Preparar los datos como los espera la API (solo IDs, igual que la app que funciona)
  const ventaData: any = {
    empresa: appointment.empresa,
    usuario: appointment.usuario._id,
    sucursal: appointment.sucursal._id,
    profesional: appointment.profesional._id,
    fechaCita: appointment.fecha,
    importe: appointment.importe,
    promocion: appointment.promocion,
    servicios: appointment.servicios.map(servicio => ({
      _id: servicio._id,
      variantes: servicio.variantes || [],
      nombre: servicio.nombre,
      duracion: servicio.duracion || "60",
      precio: servicio.precio,
      deleted: servicio.deleted || false
    })),
    variantes: appointment.variantes,
    metodoPago: metodoPago,
    productos: [],
    cita: appointment._id
  };

  // Debug info (non-sensitive only)
  if (import.meta.env.DEV) {
    console.log('=== PETICIÓN DE VENTA ===');
    console.log('URL:', 'https://api.exora.app/api/ventas');
    console.log('Token presente:', token ? 'SÍ' : 'NO');
  }

  try {

    const response = await fetch('https://api.exora.app/api/ventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify(ventaData)
    });

    if (import.meta.env.DEV) {
      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', response.status);
    }

    if (!response.ok) {
      const errorData = await response.text();
      if (import.meta.env.DEV) {
        console.log('Error response:', response.status);
      }
      throw new Error(`HTTP ${response.status}: Error en la venta`);
    }

    const responseData = await response.json();

    if (import.meta.env.DEV) {
      console.log('=== VENTA EXITOSA ===');
    }
    return responseData;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('=== ERROR EN VENTA ===');
      console.error('Error message:', error?.message);
    }

    const message = error?.response?.data?.message || error?.response?.data?.msg || error?.message || 'Error al registrar la venta';
    throw new Error(message);
  }
};
