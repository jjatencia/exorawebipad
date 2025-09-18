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

export const createVenta = async (appointment: Appointment, metodoPago: string): Promise<any> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

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

  const response = await fetch('https://api.exora.app/api/ventas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(ventaData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};