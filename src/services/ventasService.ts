import { Appointment } from '../types';
import { apiClient } from './api';
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
  // Usar el token de LBJ que tiene permisos para crear ventas
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2NjJmNWJiMmY5NTY4NTdiOGNkMGQ5Y2EiLCJub21icmUiOiJMQkoiLCJyb2xlIjoiQlVTSU5FU1NfUk9MRSIsImVtcHJlc2EiOiI2NjJmNWJiMWY5NTY4NTdiOGNkMGQ5YzciLCJwcm9mZXNpb25hbCI6bnVsbCwiaWF0IjoxNzU4NDA1MzcyfQ.Jf54Re-55s_KY-BTSDJOK32cGoHm2z15P2Lt3QYSgnw';

  if (!token) {
    throw new Error('No hay token de autenticación');
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

  console.log('=== PETICIÓN DE VENTA COMPLETA ===');
  console.log('URL:', '/api/ventas (proxy -> https://api.exora.app)');
  console.log('Token presente:', token ? 'SÍ' : 'NO');
  console.log('Datos de venta:', JSON.stringify(ventaData, null, 2));

  try {
    console.log('=== ENVIANDO PETICIÓN ===');
    console.log('=== CONFIGURACIÓN COMPLETA ===');
    console.log('URL:', 'https://api.exora.app/api/ventas');
    console.log('Method:', 'POST');
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'x-token': token ? token.substring(0, 50) + '...' : 'NO TOKEN'
    });
    console.log('Body (string):', JSON.stringify(ventaData));
    console.log('Body length:', JSON.stringify(ventaData).length);

    const response = await fetch('https://api.exora.app/api/ventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify(ventaData)
    });

    console.log('=== RESPUESTA RECIBIDA ===');
    console.log('Response object:', response);
    console.log('Status:', response.status);
    console.log('Status text:', response.statusText);
    console.log('Headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.text();
      console.log('Error response body:', errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const responseData = await response.json();

    console.log('=== RESPUESTA EXITOSA ===');
    console.log('Status:', response.status);
    console.log('Data:', responseData);
    return responseData;
  } catch (error: any) {
    console.error('=== ERROR EN VENTA ===');
    console.error('Status:', error?.response?.status);
    console.error('Response data:', error?.response?.data);
    console.error('Error message:', error?.message);
    console.error('Full error:', error);

    const message = error?.response?.data?.message || error?.response?.data?.msg || error?.message || 'Error al registrar la venta';
    throw new Error(message);
  }
};
