import React, { useState, useCallback } from 'react';
import { Appointment } from '../types';
import { CloseIcon, EuroIcon, CashIcon, CardIcon, WalletIcon, ServiceIcon, LocationIcon, ProfessionalIcon, ClockIcon } from './icons';

interface AppointmentModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onCompletePayment: (appointmentId: string, metodoPago: string, editedAppointment?: Appointment) => Promise<void>;
  onCompleteWalletPayment: (appointmentId: string, editedAppointment?: Appointment) => Promise<void>;
  onMarkNoShow: (appointmentId: string) => Promise<void>;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  onClose,
  onCompletePayment,
  onCompleteWalletPayment,
  onMarkNoShow
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handlePayment = useCallback(async (method: string) => {
    if (!appointment || isProcessing) return;

    setIsProcessing(true);
    try {
      if (method === 'monedero') {
        await onCompleteWalletPayment(appointment._id);
      } else {
        await onCompletePayment(appointment._id, method);
      }
      onClose();
    } catch (error) {
      console.error('Error al procesar pago:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [appointment, isProcessing, onCompletePayment, onCompleteWalletPayment, onClose]);

  const handleNoShow = useCallback(async () => {
    if (!appointment || isProcessing) return;

    setIsProcessing(true);
    try {
      await onMarkNoShow(appointment._id);
      onClose();
    } catch (error) {
      console.error('Error al marcar no-show:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [appointment, isProcessing, onMarkNoShow, onClose]);

  if (!appointment) return null;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Detalles de la Cita</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cliente y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-exora-primary/10 to-exora-primary/5 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Cliente</h3>
              <p className="text-xl font-bold text-exora-primary">{appointment.usuario.nombre}</p>
              {appointment.usuario.email && (
                <p className="text-sm text-gray-600 mt-1">{appointment.usuario.email}</p>
              )}
              {appointment.usuario.telefono && (
                <p className="text-sm text-gray-600">{appointment.usuario.telefono}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Fecha y Hora</h3>
              <p className="text-lg font-bold text-gray-900">{formatTime(appointment.fecha)}</p>
              <p className="text-sm text-gray-600 capitalize">{formatDate(appointment.fecha)}</p>
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <ServiceIcon size={18} className="mr-2" />
              Servicios
            </h3>
            <div className="space-y-2">
              {appointment.servicios.map((servicio, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{servicio.nombre}</span>
                  <span className="text-lg font-bold text-exora-primary">
                    {servicio.precio.toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Profesional y Sucursal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <ProfessionalIcon size={20} className="text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Profesional</h3>
                <p className="text-gray-700">{appointment.profesional.nombre}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <LocationIcon size={20} className="text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Sucursal</h3>
                <p className="text-gray-700">{appointment.sucursal.nombre}</p>
              </div>
            </div>
          </div>

          {/* Duración e Importe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <ClockIcon size={20} className="text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Duración</h3>
                <p className="text-gray-700">{appointment.duracion || '60'} minutos</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <EuroIcon size={20} className="text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Importe Total</h3>
                <p className="text-2xl font-bold text-green-600">{appointment.importe.toFixed(2)}€</p>
              </div>
            </div>
          </div>

          {/* Estado de Pago */}
          <div className="p-4 rounded-xl border-2 border-dashed"
               style={{
                 borderColor: appointment.pagada ? '#10B981' : '#F59E0B',
                 backgroundColor: appointment.pagada ? '#F0FDF4' : '#FFFBEB'
               }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Estado de Pago</h3>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                appointment.pagada
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {appointment.pagada ? 'PAGADO' : 'PENDIENTE'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!appointment.pagada && (
          <div className="p-6 border-t border-gray-200">
            {!showPaymentOptions ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentOptions(true)}
                  className="flex-1 bg-exora-primary text-white px-6 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  disabled={isProcessing}
                >
                  <EuroIcon size={20} />
                  <span>Procesar Pago</span>
                </button>

                <button
                  onClick={handleNoShow}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  disabled={isProcessing}
                >
                  No Show
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center">Método de Pago</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handlePayment('efectivo')}
                    className="flex items-center justify-center space-x-2 p-4 border-2 border-gray-300 rounded-xl hover:border-exora-primary hover:bg-exora-primary/5 transition-all"
                    disabled={isProcessing}
                  >
                    <CashIcon size={20} />
                    <span className="font-medium">Efectivo</span>
                  </button>

                  <button
                    onClick={() => handlePayment('tarjeta')}
                    className="flex items-center justify-center space-x-2 p-4 border-2 border-gray-300 rounded-xl hover:border-exora-primary hover:bg-exora-primary/5 transition-all"
                    disabled={isProcessing}
                  >
                    <CardIcon size={20} />
                    <span className="font-medium">Tarjeta</span>
                  </button>

                  <button
                    onClick={() => handlePayment('monedero')}
                    className="flex items-center justify-center space-x-2 p-4 border-2 border-gray-300 rounded-xl hover:border-exora-primary hover:bg-exora-primary/5 transition-all"
                    disabled={isProcessing}
                  >
                    <WalletIcon size={20} />
                    <span className="font-medium">Monedero</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowPaymentOptions(false)}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;