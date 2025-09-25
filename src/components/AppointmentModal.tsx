import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Appointment, Servicio, Variante } from '../types';
import { PromocionesService, Promocion } from '../services/promocionesService';
import { MonederoService } from '../services/monederoService';
import { CloseIcon, EuroIcon, CashIcon, CardIcon, WalletIcon, ServiceIcon, LocationIcon, ProfessionalIcon, ClockIcon, VariantIcon, CheckIcon } from './icons';

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
  // Estados básicos
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showNoShowConfirm, setShowNoShowConfirm] = useState(false);

  // Estados para pago dividido
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [isDividedPayment, setIsDividedPayment] = useState<boolean>(false);
  const [inputAmount, setInputAmount] = useState<string>('');

  // Estados para edición
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [promocionesDisponibles, setPromocionesDisponibles] = useState<Promocion[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [variantesSeleccionadas, setVariantesSeleccionadas] = useState<Variante[]>([]);
  const [promocionesSeleccionadas, setPromocionesSeleccionadas] = useState<string[]>([]);
  const [precioCalculado, setPrecioCalculado] = useState<number>(0);
  const [precioConDescuento, setPrecioConDescuento] = useState<number>(0);

  // Métodos de pago
  const paymentMethods = useMemo(
    () => [
      { id: 'Pago en efectivo', name: 'Efectivo', icon: CashIcon },
      { id: 'Pago Tarjeta', name: 'Tarjeta', icon: CardIcon },
      { id: 'Monedero', name: 'Monedero', icon: WalletIcon }
    ],
    []
  );

  // Efectos y callbacks igual que antes pero funcionalmente
  useEffect(() => {
    if (!appointment) return;
    const servicio = appointment.servicios[0] || null;
    const variantes = appointment.variantes || [];
    const promociones = appointment.promocion || [];
    setServicioSeleccionado(servicio);
    setVariantesSeleccionadas(variantes);
    setPromocionesSeleccionadas(promociones);
    setPrecioCalculado(appointment.importe);
    setPrecioConDescuento(appointment.importe);
    setIsEditing(false);
    setShowPaymentOptions(false);
    setShowNoShowConfirm(false);
    setSelectedPaymentMethod('');
    setPaymentAmounts({});
    setIsDividedPayment(false);
  }, [appointment]);

  // Cargar promociones para mostrar en la vista
  useEffect(() => {
    const cargarPromociones = async () => {
      if (!appointment) return;
      try {
        const promociones = await PromocionesService.getPromocionesEmpresa(appointment.empresa);
        setPromocionesDisponibles(promociones);
      } catch (error) {
        console.error('Error cargando promociones:', error);
      }
    };
    cargarPromociones();
  }, [appointment]);

  // Calcular importes
  const totalAsignado = Object.values(paymentAmounts).reduce((sum, amount) => sum + amount, 0);
  const importeTotal = isEditing ? precioCalculado : precioConDescuento;
  const importeRestante = Math.max(0, importeTotal - totalAsignado);
  const esPagoCompleto = Math.abs(importeRestante) < 0.01;

  // Verificar saldo del monedero
  const saldoMonedero = appointment?.usuario.saldoMonedero || 0;
  const tieneSaldoSuficiente = MonederoService.tieneSaldoSuficiente(saldoMonedero, importeTotal);

  // Callbacks faltantes
  const handleConfirmAmount = useCallback(() => {
    if (!activeInput) return;
    const numAmount = Math.max(0, parseFloat(inputAmount) || 0);
    const maxAmount = importeRestante + (paymentAmounts[activeInput] || 0);
    const finalAmount = Math.min(numAmount, maxAmount);
    setPaymentAmounts(prev => ({
      ...prev,
      [activeInput]: finalAmount
    }));
    setActiveInput(null);
    setInputAmount('');
  }, [activeInput, inputAmount, importeRestante, paymentAmounts]);

  const handleSetAllAmount = useCallback(() => {
    if (!activeInput) return;
    const maxAmount = importeRestante + (paymentAmounts[activeInput] || 0);
    setInputAmount(maxAmount.toString());
  }, [activeInput, importeRestante, paymentAmounts]);

  const handleCompletePayment = async () => {
    // Prevenir múltiples clicks
    if (isProcessingPayment) {
      return;
    }

    // Validaciones existentes
    if (!appointment || isProcessing) return;
    if (!isDividedPayment && !selectedPaymentMethod) return;
    if (isDividedPayment && !esPagoCompleto) return;

    // Activar estado de procesamiento INMEDIATAMENTE
    setIsProcessingPayment(true);
    setIsProcessing(true);

    try {
      let editedAppointment: Appointment | undefined;
      const hasServiceChanges = servicioSeleccionado?._id !== appointment.servicios[0]?._id;
      const hasVariantChanges = variantesSeleccionadas.length !== (appointment.variantes?.length || 0) ||
        variantesSeleccionadas.some(v => !(appointment.variantes?.some(av => av._id === v._id)));
      const hasPromocionChanges = promocionesSeleccionadas.length !== (appointment.promocion?.length || 0) ||
        promocionesSeleccionadas.some(p => !appointment.promocion?.includes(p)) ||
        appointment.promocion?.some(p => !promocionesSeleccionadas.includes(p));

      if (hasServiceChanges || hasVariantChanges || hasPromocionChanges) {
        editedAppointment = {
          ...appointment,
          servicios: servicioSeleccionado ? [servicioSeleccionado] : appointment.servicios,
          variantes: variantesSeleccionadas,
          promocion: promocionesSeleccionadas,
          importe: precioConDescuento
        };
      }

      if (!isDividedPayment) {
        if (selectedPaymentMethod === 'Monedero') {
          await onCompleteWalletPayment(appointment._id, editedAppointment);
        } else {
          await onCompletePayment(appointment._id, selectedPaymentMethod, editedAppointment);
        }
      } else {
        const pagosActivos = Object.entries(paymentAmounts)
          .filter(([_, amount]) => amount > 0)
          .map(([methodId, amount]) => ({ methodId, amount }));

        // Para pagos divididos, usar await para procesar secuencialmente
        for (const pago of pagosActivos) {
          const appointmentConImporte = editedAppointment
            ? { ...editedAppointment, importe: pago.amount }
            : { ...appointment, importe: pago.amount };

          if (pago.methodId === 'Monedero') {
            await onCompleteWalletPayment(appointment._id, appointmentConImporte);
          } else {
            await onCompletePayment(appointment._id, pago.methodId, appointmentConImporte);
          }
        }
      }
      onClose();
    } catch (error) {
      console.error('Error procesando pago:', error);
    } finally {
      setIsProcessing(false);
      // Delay de seguridad antes de permitir otro click
      setTimeout(() => {
        setIsProcessingPayment(false);
      }, 1000);
    }
  };

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Detalles de la Cita</h2>
            <div className="text-lg text-gray-600 capitalize">{formatDate(appointment.fecha)}</div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isProcessingPayment || isProcessing
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100'
            }`}
            disabled={isProcessingPayment || isProcessing}
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Contenido principal en dos columnas más compactas */}
        <div className="flex-1 flex overflow-hidden">
          {/* Columna 1: Información Completa */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="bg-gradient-to-br from-exora-primary/10 to-exora-primary/5 p-6 rounded-xl mb-6">
              <h3 className="text-2xl font-bold text-exora-primary mb-4">{appointment.usuario.nombre}</h3>
              <div className="space-y-3 text-base">
                {appointment.usuario.email && (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-exora-primary rounded-full"></span>
                    <p className="text-gray-700">{appointment.usuario.email}</p>
                  </div>
                )}
                {appointment.usuario.telefono && (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-exora-primary rounded-full"></span>
                    <p className="text-gray-700">{appointment.usuario.telefono}</p>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <ClockIcon size={18} className="text-exora-primary" />
                  <span className="font-bold text-lg">{formatTime(appointment.fecha)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LocationIcon size={18} className="text-exora-primary" />
                  <span className="font-medium">{appointment.sucursal.nombre}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <ProfessionalIcon size={22} className="text-gray-600" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Profesional</h4>
                  <p className="text-gray-700">{appointment.profesional.nombre}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <ClockIcon size={22} className="text-gray-600" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Duración</h4>
                  <p className="text-gray-700">{appointment.duracion || '60'} minutos</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className={`w-5 h-5 rounded-full ${
                  appointment.pagada ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Estado</h4>
                  <p className="text-gray-700">{appointment.pagada ? 'Pagado' : 'Pendiente'}</p>
                </div>
              </div>
            </div>

            {/* Servicios en la misma columna */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <ServiceIcon size={20} className="mr-2" />
                Servicios
              </h3>
              <div className="space-y-3">
                {appointment.servicios.map((servicio, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{servicio.nombre}</span>
                    <span className="text-lg font-bold text-exora-primary">
                      {((servicio.precio || 0) / 100).toFixed(2)}€
                    </span>
                  </div>
                ))}

                {/* Variantes */}
                {appointment.variantes && appointment.variantes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <VariantIcon size={16} className="mr-2" />
                      Variantes:
                    </h4>
                    <div className="space-y-2">
                      {appointment.variantes.map((variante, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <span className="text-sm text-gray-700">{variante.nombre}</span>
                          <span className="text-sm font-bold text-blue-600">
                            +{((variante.precio || 0) / 100).toFixed(2)}€
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promociones aplicadas */}
                {appointment.promocion && appointment.promocion.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <EuroIcon size={16} className="mr-2" />
                      Promociones Aplicadas:
                    </h4>
                    <div className="space-y-2">
                      {promocionesDisponibles
                        .filter(promocion => appointment.promocion.includes(promocion._id))
                        .map((promocion, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                {promocion.titulo || 'Promoción especial'}
                              </span>
                              {promocion.descripcion && (
                                <p className="text-xs text-gray-500 mt-1">{promocion.descripcion}</p>
                              )}
                            </div>
                            <span className="text-sm font-bold text-green-600">
                              {promocion.porcentaje && `-${promocion.porcentaje}%`}
                              {promocion.cifra && `-${((promocion.cifra || 0) / 100).toFixed(2)}€`}
                            </span>
                          </div>
                        ))}
                      {promocionesDisponibles.filter(p => appointment.promocion.includes(p._id)).length === 0 && (
                        <div className="p-2 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {appointment.promocion.length} promoción{appointment.promocion.length > 1 ? 'es' : ''} aplicada{appointment.promocion.length > 1 ? 's' : ''}
                            </span>
                            <span className="text-sm font-bold text-green-600">
                              Descuento aplicado
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Importe Total */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="text-center">
                <h4 className="text-base font-semibold text-gray-900 mb-2">Importe Total</h4>
                <p className="text-2xl font-bold text-green-600">€{importeTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Columna 2: Acciones de Pago */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {!appointment.pagada ? (
              <div className="space-y-6">
                {!showPaymentOptions ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowPaymentOptions(true)}
                      className="w-full bg-exora-primary text-white px-6 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                      disabled={isProcessing}
                    >
                      <EuroIcon size={20} />
                      <span>Procesar Pago</span>
                    </button>
                    <button
                      onClick={() => setShowNoShowConfirm(true)}
                      className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                      disabled={isProcessing}
                    >
                      No presentado
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Método de Pago</h3>
                      <div className="text-2xl font-bold text-exora-primary mb-2">
                        €{importeTotal.toFixed(2)}
                      </div>
                      {isDividedPayment && (
                        <div className="text-sm text-gray-600">
                          Restante: €{importeRestante.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Métodos de pago más compactos */}
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        const isSelected = selectedPaymentMethod === method.id;
                        const hasAmount = paymentAmounts[method.id] > 0;
                        const isWallet = method.id === 'Monedero';
                        const isDisabled = isWallet && saldoMonedero <= 0;

                        return (
                          <button
                            key={method.id}
                            onClick={() => {
                              if (!isDividedPayment) {
                                setSelectedPaymentMethod(method.id);
                                setPaymentAmounts({});
                              } else {
                                setActiveInput(method.id);
                                setInputAmount((paymentAmounts[method.id] || 0).toString());
                              }
                            }}
                            onTouchStart={(e) => {
                              if (isDisabled) return;
                              const timeoutId = setTimeout(() => {
                                setIsDividedPayment(true);
                                setSelectedPaymentMethod('');
                                setActiveInput(method.id);
                                setInputAmount('');
                                if (navigator.vibrate) navigator.vibrate(50);
                              }, 500);

                              const handleTouchEnd = () => {
                                clearTimeout(timeoutId);
                                e.currentTarget.removeEventListener('touchend', handleTouchEnd);
                                e.currentTarget.removeEventListener('touchcancel', handleTouchEnd);
                              };

                              e.currentTarget.addEventListener('touchend', handleTouchEnd);
                              e.currentTarget.addEventListener('touchcancel', handleTouchEnd);
                            }}
                            disabled={isDisabled}
                            className={`w-full relative p-4 border-2 rounded-xl flex items-center space-x-3 transition-all ${
                              isDisabled
                                ? 'border-gray-300 opacity-50 cursor-not-allowed bg-gray-100'
                                : ((!isDividedPayment && isSelected) || (isDividedPayment && hasAmount))
                                ? 'border-exora-primary bg-exora-primary/10 shadow-md'
                                : 'border-gray-300 hover:border-exora-primary/50 hover:bg-gray-50'
                            }`}
                          >
                            <IconComponent size={32} className={isDisabled ? 'text-gray-400' : 'text-exora-primary'} />
                            <div className="flex-1 text-left">
                              <span className={`font-semibold ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                                {method.name}
                              </span>
                              {isWallet && (
                                <div className="mt-1">
                                  <div className={`text-xs px-2 py-1 rounded inline-block ${
                                    tieneSaldoSuficiente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    €{saldoMonedero.toFixed(2)}
                                  </div>
                                </div>
                              )}
                              {!isWallet && isDividedPayment && hasAmount && (
                                <div className="mt-1">
                                  <div className="text-xs bg-exora-primary/20 text-exora-primary px-2 py-1 rounded font-bold inline-block">
                                    €{paymentAmounts[method.id].toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>
                            {!isDisabled && ((!isDividedPayment && isSelected) || (isDividedPayment && hasAmount)) && (
                              <div>
                                <CheckIcon size={16} className="text-exora-primary" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Controles de pago dividido */}
                    {isDividedPayment && (
                      <div className="text-center">
                        <button
                          onClick={() => {
                            setIsDividedPayment(false);
                            setPaymentAmounts({});
                            setSelectedPaymentMethod('');
                            setActiveInput(null);
                          }}
                          className="text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Volver a pago único
                        </button>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="space-y-3">
                      <button
                        onClick={handleCompletePayment}
                        disabled={isProcessingPayment || (isDividedPayment ? !esPagoCompleto : !selectedPaymentMethod)}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          isProcessingPayment
                            ? 'cursor-not-allowed opacity-75 bg-gray-400 text-white'
                            : (isDividedPayment ? esPagoCompleto : selectedPaymentMethod)
                            ? 'bg-exora-primary text-white hover:opacity-90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        style={isProcessingPayment ? { backgroundColor: '#9CA3AF', color: 'white' } : undefined}
                      >
                        {isProcessingPayment ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Procesando...</span>
                          </div>
                        ) : (
                          isDividedPayment && totalAsignado > 0
                            ? `Completar Pago (€${totalAsignado.toFixed(2)})`
                            : 'Completar Pago'
                        )}
                      </button>
                      <button
                        onClick={() => setShowPaymentOptions(false)}
                        disabled={isProcessingPayment}
                        className={`w-full py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-colors ${
                          isProcessingPayment ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Vista cuando ya está pagado
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Pago Completado</h3>
                <p className="text-lg text-gray-600">Esta cita ya ha sido procesada</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmación No Show */}
        {showNoShowConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon size={32} className="text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar No Presentado</h3>
                <p className="text-gray-600">
                  ¿Confirmas que <strong>{appointment.usuario.nombre} {appointment.usuario.apellidos || ''}</strong> no se presentó a su cita?
                </p>
                <div className="mt-3 text-sm text-gray-500">
                  Esta acción marcará la cita como no presentado y liberará el horario.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNoShowConfirm(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    setIsProcessing(true);
                    try {
                      await onMarkNoShow(appointment._id);
                      onClose();
                    } catch (error) {
                      console.error('Error al marcar no-show:', error);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de entrada de importe para pago dividido */}
        {activeInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-xl font-bold mb-2 text-exora-primary">
                  {paymentMethods.find(m => m.id === activeInput)?.name}
                </div>
                <div className="text-sm text-gray-600">
                  Máximo: €{(importeRestante + (paymentAmounts[activeInput] || 0)).toFixed(2)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-4 border-2 border-exora-primary rounded-xl text-xl text-center font-bold"
                    step="0.01"
                    min="0"
                    max={importeRestante + (paymentAmounts[activeInput] || 0)}
                    autoFocus
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-exora-primary">
                    €
                  </div>
                </div>

                <button
                  onClick={handleSetAllAmount}
                  className="w-full py-3 border-2 border-exora-primary text-exora-primary rounded-xl font-medium hover:bg-exora-primary/5 transition-colors"
                >
                  Importe completo: €{(importeRestante + (paymentAmounts[activeInput] || 0)).toFixed(2)}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setActiveInput(null);
                      setInputAmount('');
                    }}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmAmount}
                    className="flex-1 py-3 bg-exora-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
// Fixed JSX structure