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

  const CashIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  );

  const CardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );

  const WalletIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const paymentMethods = [
    { id: 'Pago en efectivo', name: 'Efectivo', icon: CashIcon },
    { id: 'Pago Tarjeta', name: 'Tarjeta', icon: CardIcon },
    { id: 'Monedero', name: 'Monedero', icon: WalletIcon }
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
        backgroundColor: '#FCFFA8', // Amarillo personalizado
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
        width: '90%',
        maxWidth: '380px',
        height: '90%',
        maxHeight: '550px',
        minHeight: '400px',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="p-4 h-full flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
        >
          <CloseIcon />
        </button>
        {/* Header */}
        <div className="flex-shrink-0 text-center mb-4 mt-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: '#555BF6' }}>
            {appointment.usuario.nombre}
          </h2>
          <div className="text-base" style={{ color: '#555BF6' }}>
            {new Date(appointment.fecha).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* Service Info */}
        <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
          <div className="flex items-start space-x-3" style={{ color: '#555BF6' }}>
            <ServiceIcon />
            <div className="flex-1">
              <div className="text-base font-medium">
                {appointment.servicios[0]?.nombre || 'Servicio no especificado'}
              </div>
            </div>
          </div>

          {appointment.variantes && appointment.variantes.length > 0 && (
            <div className="flex items-start space-x-3" style={{ color: '#555BF6' }}>
              <VariantIcon />
              <div className="flex-1">
                <div className="text-base font-medium">Variante:</div>
                <div className="text-sm mt-1" style={{ color: '#555BF6' }}>
                  {appointment.variantes.map(v => v.nombre).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#FAFAB0' }}>
            <div className="text-base font-medium" style={{ color: '#555BF6' }}>Total a cobrar</div>
            <div className="text-2xl font-bold" style={{ color: '#555BF6' }}>
              €{appointment.importe.toFixed(2)}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <div className="text-base font-medium" style={{ color: '#555BF6' }}>Método de pago:</div>
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`w-full p-3 rounded-lg border-2 flex items-center space-x-3 transition-all ${
                    selectedPaymentMethod === method.id
                      ? 'border-white shadow-md'
                      : 'border-white/50 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: selectedPaymentMethod === method.id ? '#FAFAB0' : 'rgba(250, 250, 176, 0.5)'
                  }}
                >
                  <IconComponent />
                  <span className="text-base font-medium" style={{ color: '#555BF6' }}>{method.name}</span>
                  {selectedPaymentMethod === method.id && (
                    <div className="ml-auto">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 space-y-2">
          <button
            onClick={handleCompletePayment}
            disabled={!selectedPaymentMethod}
            className={`w-full py-3 rounded-lg font-bold text-base transition-all ${
              selectedPaymentMethod
                ? 'hover:opacity-90 shadow-lg'
                : 'cursor-not-allowed'
            }`}
            style={
              selectedPaymentMethod
                ? { backgroundColor: '#555BF6', color: 'white' }
                : { backgroundColor: '#d1d5db', color: '#6b7280' }
            }
          >
            Completar Pago
          </button>
        </div>
      </div>
    </animated.div>
  );
};

export default PaymentCard;