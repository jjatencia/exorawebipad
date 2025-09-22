import React, { useMemo, useState, useEffect } from 'react';
import { animated } from '@react-spring/web';
import { Appointment } from '../types';
import { PromocionesService } from '../services/promocionesService';
import {
  CardIcon,
  CashIcon,
  CheckIcon,
  ServiceIcon,
  VariantIcon,
  WalletIcon
} from './icons';

interface PaymentCardProps {
  appointment: Appointment;
  onCompletePayment?: (appointmentId: string, metodoPago: string) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  appointment,
  onCompletePayment
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [precioConDescuento, setPrecioConDescuento] = useState<number>(appointment.importe);
  const [descuentoTotal, setDescuentoTotal] = useState<number>(0);
  const [loadingDescuentos, setLoadingDescuentos] = useState<boolean>(false);
  const appointmentDate = useMemo(() => new Date(appointment.fecha), [appointment.fecha]);
  const formattedTime = useMemo(
    () =>
      appointmentDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    [appointmentDate]
  );

  // Calcular descuentos por promociones
  useEffect(() => {
    const calcularDescuentos = async () => {
      if (!appointment.promocion || appointment.promocion.length === 0) {
        setPrecioConDescuento(appointment.importe);
        setDescuentoTotal(0);
        return;
      }

      setLoadingDescuentos(true);
      try {
        // Obtener promociones de la empresa
        const promocionesEmpresa = await PromocionesService.getPromocionesEmpresa(appointment.empresa);

        // Filtrar promociones aplicadas
        const promocionesAplicadas = promocionesEmpresa.filter(promocion =>
          appointment.promocion.includes(promocion._id)
        );

        let descuentoAcumulado = 0;

        // Calcular descuento total
        promocionesAplicadas.forEach(promocion => {
          // Solo aplicar descuentos si la promoción está activa y es de tipo descuento para servicios
          if (promocion.activo && promocion.tipo === 'descuento' && promocion.destino === 'servicio') {
            if (promocion.porcentaje !== null && promocion.porcentaje !== undefined) {
              // Descuento por porcentaje
              const descuento = appointment.importe * (promocion.porcentaje / 100);
              descuentoAcumulado += descuento;
            } else if (promocion.cifra !== undefined && promocion.cifra > 0) {
              // Descuento por cantidad fija (en centavos, convertir a euros)
              const descuento = promocion.cifra / 100;
              descuentoAcumulado += descuento;
            }
          }
        });

        const precioFinal = Math.max(0, appointment.importe - descuentoAcumulado);
        setPrecioConDescuento(precioFinal);
        setDescuentoTotal(descuentoAcumulado);
      } catch (error) {
        console.error('Error calculando descuentos en payment:', error);
        // En caso de error, usar precio original
        setPrecioConDescuento(appointment.importe);
        setDescuentoTotal(0);
      } finally {
        setLoadingDescuentos(false);
      }
    };

    calcularDescuentos();
  }, [appointment.promocion, appointment.empresa, appointment.importe]);

  const paymentMethods = useMemo(
    () => [
      { id: 'Pago en efectivo', name: 'Efectivo', icon: CashIcon },
      { id: 'Pago Tarjeta', name: 'Tarjeta', icon: CardIcon },
      { id: 'Monedero', name: 'Monedero', icon: WalletIcon }
    ],
    []
  );

  const handleCompletePayment = () => {
    if (!selectedPaymentMethod) {
      return;
    }
    if (onCompletePayment) {
      onCompletePayment(appointment._id, selectedPaymentMethod);
    }
  };

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
        {/* Header */}
        <div className="flex-shrink-0 text-center mb-4 mt-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: '#555BF6' }}>
            {appointment.usuario.nombre}
          </h2>
          <div className="text-base" style={{ color: '#555BF6' }}>
            {formattedTime}
          </div>
        </div>

        {/* Service Info */}
        <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
          <div className="flex items-start space-x-3" style={{ color: '#555BF6' }}>
            <ServiceIcon size={16} />
            <div className="flex-1">
              <div className="text-base font-medium">
                {appointment.servicios[0]?.nombre || 'Servicio no especificado'}
              </div>
            </div>
          </div>

          {appointment.variantes && appointment.variantes.length > 0 && (
            <div className="flex items-start space-x-3" style={{ color: '#555BF6' }}>
              <VariantIcon size={16} />
              <div className="flex-1">
                <div className="text-base font-medium">Variante:</div>
                <div className="text-sm mt-1" style={{ color: '#555BF6' }}>
                  {appointment.variantes.map(v => v.nombre).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Promociones aplicadas */}
          {appointment.promocion && appointment.promocion.length > 0 && (
            <div className="flex items-start space-x-3" style={{ color: '#555BF6' }}>
              <div className="flex-1">
                <div className="text-base font-medium">Promociones:</div>
                <div className="text-sm mt-1">
                  {appointment.promocion.map((promocionId, index) => {
                    let label = 'Promoción especial';
                    if (promocionId === '66945b4a5706bb70baa15bc0') {
                      label = 'Aleatorio o barbero Junior';
                    } else if (promocionId === '66aff43347f5e3f837f20ad7') {
                      label = 'Mañanas';
                    }
                    return (
                      <span
                        key={promocionId || index}
                        className="inline-block px-2 py-1 rounded-md mr-1 mb-1 text-xs"
                        style={{ backgroundColor: '#E0E7FF', color: '#555BF6' }}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#FAFAB0' }}>
            <div className="text-base font-medium" style={{ color: '#555BF6' }}>Total a cobrar</div>
            {loadingDescuentos ? (
              <div className="text-lg" style={{ color: '#555BF6' }}>Calculando...</div>
            ) : (
              <>
                {descuentoTotal > 0 ? (
                  <>
                    <div className="text-sm text-gray-600 line-through">
                      €{appointment.importe.toFixed(2)}
                    </div>
                    <div className="text-2xl font-bold" style={{ color: '#555BF6' }}>
                      €{precioConDescuento.toFixed(2)}
                    </div>
                    <div className="text-xs text-red-600">
                      Descuento: -€{descuentoTotal.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-bold" style={{ color: '#555BF6' }}>
                    €{appointment.importe.toFixed(2)}
                  </div>
                )}
              </>
            )}
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
                  <IconComponent size={20} style={{ color: '#555BF6' }} />
                  <span className="text-base font-medium" style={{ color: '#555BF6' }}>{method.name}</span>
                  {selectedPaymentMethod === method.id && (
                    <div className="ml-auto">
                      <CheckIcon size={16} strokeWidth={3} style={{ color: '#555BF6' }} />
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
