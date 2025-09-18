import { Appointment } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

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

export const createVenta = async (appointment: Appointment, metodoPago: string): Promise<any> => {
  // Intenta obtener el token de ambas claves posibles
  let token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) {
    token = localStorage.getItem('exora_token');
  }

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');

  // Preparar los datos para la API
  const ventaData: VentaData = {
    usuario: appointment.usuario._id,
    empresa: appointment.empresa,
    sucursal: appointment.sucursal._id,
    profesional: appointment.profesional._id,
    fechaCita: appointment.fecha,
    importe: appointment.importe,
    promocion: appointment.promocion,
    servicios: appointment.servicios.map(servicio => ({
      _id: servicio._id,
      nombre: servicio.nombre,
      precio: servicio.precio
    })),
    variantes: appointment.variantes.map(variante => ({
      _id: variante._id,
      nombre: variante.nombre
    })),
    productos: [],
    metodoPago: metodoPago,
    cita: appointment._id,
    descuentos: appointment.descuentos,
    fechaVenta: new Date().toISOString()
  };

  console.log('📤 Enviando venta a API:', {
    url: 'https://api.exora.app/api/ventas',
    method: 'POST',
    hasToken: !!token,
    appointmentId: appointment._id
  });

  const response = await fetch('https://api.exora.app/api/ventas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-token': token
    },
    body: JSON.stringify(ventaData)
  });

  console.log('📡 Respuesta de la API:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Error de la API:', errorData);
    throw new Error(errorData.message || errorData.msg || `Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};