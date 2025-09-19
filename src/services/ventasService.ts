import { Appointment } from '../types';
import { apiClient } from './api';
import { AuthService } from './authService';

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
  const token = AuthService.getToken();

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  // Preparar los datos como los espera la API (sin estructura envuelta)
  const ventaData: any = {
    usuario: {
      _id: appointment.usuario._id,
      nombre: appointment.usuario.nombre,
      email: appointment.usuario.email
    },
    empresa: {
      _id: appointment.empresa,
      nombre: "LBJ" // TODO: obtener nombre real de la empresa
    },
    sucursal: {
      _id: appointment.sucursal._id,
      nombre: appointment.sucursal.nombre
    },
    profesional: {
      _id: appointment.profesional._id,
      nombre: appointment.profesional.nombre
    },
    fechaCita: appointment.fecha,
    importe: appointment.importe,
    promocion: appointment.promocion.map((promocionId: string) => ({
      _id: promocionId,
      titulo: "Aleatorio o Barbero Junior" // TODO: mapear títulos reales
    })),
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
    fechaVenta: new Date().toISOString(),
    creacion: new Date().toISOString(),
    modificacion: new Date().toISOString()
  };
  try {
    const response = await apiClient.post('/ventas', ventaData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.response?.data?.msg || error?.message || 'Error al registrar la venta';
    throw new Error(message);
  }
};
