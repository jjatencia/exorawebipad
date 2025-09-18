import React, { useState } from 'react';
import { animated } from '@react-spring/web';
import { Appointment } from '../types';

interface PaymentCardProps {
  appointment: Appointment;
  onCompletePayment?: (appointmentId: string, metodoPago: string) => void;
  onCancel?: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  appointment,
  onCompletePayment,
  onCancel
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const paymentMethods = [
    { id: 'Pago en efectivo', name: 'Efectivo', icon: '💵' },
    { id: 'Pago Tarjeta', name: 'Tarjeta', icon: '💳' },
    { id: 'Monedero', name: 'Monedero', icon: '👛' }
  ];

  const handleCompletePayment = () => {
    if (!selectedPaymentMethod) {
      return;
    }
    if (onCompletePayment) {
      onCompletePayment(appointment._id, selectedPaymentMethod);
    }
  };

  // Icono Servicio (bolsa/shopping bag)
  const ServiceIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );

  // Icono Variante (flechas cruzadas curvas)
  const VariantIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7h13l-4-4"/>
      <path d="M21 7l-4 4"/>
      <path d="M21 17H8l4 4"/>
      <path d="M3 17l4-4"/>
    </svg>
  );

  return (
    <animated.div
      style={{
        backgroundColor: '#FDE047', // Amarillo como el botón
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
        width: '90%',
        maxWidth: '380px',
        height: '90%',
        maxHeight: '550px',
        minHeight: '400px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {appointment.usuario.nombre}
          </h2>
          <div className="text-lg text-gray-700">
            {new Date(appointment.fecha).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* Service Info */}
        <div className="flex-1 space-y-4 mb-6">
          <div className="flex items-start space-x-3 text-gray-700">
            <ServiceIcon />
            <div className="flex-1">
              <div className="text-base font-medium">
                {appointment.servicios[0]?.nombre || 'Servicio no especificado'}
              </div>
            </div>
          </div>

          {appointment.variantes && appointment.variantes.length > 0 && (
            <div className="flex items-start space-x-3 text-gray-700">
              <VariantIcon />
              <div className="flex-1">
                <div className="text-base font-medium">Variante:</div>
                <div className="text-sm mt-1 text-gray-600">
                  {appointment.variantes.map(v => v.nombre).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="bg-white/30 rounded-lg p-4 text-center">
            <div className="text-lg font-medium text-gray-700">Total a cobrar</div>
            <div className="text-3xl font-bold text-gray-900">
              €{appointment.importe.toFixed(2)}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <div className="text-lg font-medium text-gray-800">Método de pago:</div>
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`w-full p-4 rounded-lg border-2 flex items-center space-x-3 transition-all ${
                  selectedPaymentMethod === method.id
                    ? 'border-white bg-white/40 shadow-md'
                    : 'border-white/50 bg-white/20 hover:bg-white/30'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
                <span className="text-lg font-medium text-gray-800">{method.name}</span>
                {selectedPaymentMethod === method.id && (
                  <div className="ml-auto">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 space-y-3">
          <button
            onClick={handleCompletePayment}
            disabled={!selectedPaymentMethod}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              selectedPaymentMethod
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Completar Pago
          </button>

          <button
            onClick={onCancel}
            className="w-full py-3 rounded-lg border-2 border-white/50 bg-white/20 text-gray-800 font-medium hover:bg-white/30 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </animated.div>
  );
};

export default PaymentCard;