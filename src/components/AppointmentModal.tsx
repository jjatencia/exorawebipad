import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Appointment, Servicio, Variante } from '../types';
import { PromocionesService, Promocion } from '../services/promocionesService';
import { ServiciosService } from '../services/serviciosService';
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
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // Estados para pago dividido
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [isDividedPayment, setIsDividedPayment] = useState<boolean>(false);
  const [inputAmount, setInputAmount] = useState<string>('');

  // Estados para edición
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<Servicio[]>([]);
  const [variantesDisponibles, setVariantesDisponibles] = useState<Variante[]>([]);
  const [promocionesDisponibles, setPromocionesDisponibles] = useState<Promocion[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [variantesSeleccionadas, setVariantesSeleccionadas] = useState<Variante[]>([]);
  const [promocionesSeleccionadas, setPromocionesSeleccionadas] = useState<string[]>([]);
  const [precioCalculado, setPrecioCalculado] = useState<number>(0);
  const [precioConDescuento, setPrecioConDescuento] = useState<number>(0);
  const [descuentoTotal, setDescuentoTotal] = useState<number>(0);

  // Estados originales para cancelar cambios
  const [estadoOriginal, setEstadoOriginal] = useState({
    servicioSeleccionado: null as Servicio | null,
    variantesSeleccionadas: [] as Variante[],
    promocionesSeleccionadas: [] as string[]
  });

  // Inicializar estados cuando cambie el appointment
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
    setDescuentoTotal(0);

    setEstadoOriginal({
      servicioSeleccionado: servicio,
      variantesSeleccionadas: variantes,
      promocionesSeleccionadas: promociones
    });
  }, [appointment]);

  // Calcular descuentos por promociones
  useEffect(() => {
    const calcularDescuentos = async () => {
      if (!appointment || !appointment.promocion || appointment.promocion.length === 0) {
        setPrecioConDescuento(appointment?.importe || 0);
        setDescuentoTotal(0);
        return;
      }

      try {
        const promocionesEmpresa = await PromocionesService.getPromocionesEmpresa(appointment.empresa);
        const promocionesAplicadas = promocionesEmpresa.filter(promocion =>
          appointment.promocion.includes(promocion._id)
        );

        let descuentoAcumulado = 0;

        promocionesAplicadas.forEach(promocion => {
          if (promocion.activo && promocion.tipo === 'descuento' && promocion.destino === 'servicio') {
            if (promocion.porcentaje !== null && promocion.porcentaje !== undefined) {
              const descuento = appointment.importe * (promocion.porcentaje / 100);
              descuentoAcumulado += descuento;
            } else if (promocion.cifra !== undefined && promocion.cifra > 0) {
              const descuento = promocion.cifra / 100;
              descuentoAcumulado += descuento;
            }
          }
        });

        const precioFinal = Math.max(0, appointment.importe - descuentoAcumulado);
        setPrecioConDescuento(precioFinal);
        setDescuentoTotal(descuentoAcumulado);
      } catch (error) {
        console.error('Error calculando descuentos:', error);
        setPrecioConDescuento(appointment.importe);
        setDescuentoTotal(0);
      }
    };

    calcularDescuentos();
  }, [appointment]);

  // Cargar datos para edición
  useEffect(() => {
    const cargarDatosEdicion = async () => {
      if (!isEditing || !appointment) return;

      try {
        const [servicios, variantes, promociones] = await Promise.all([
          ServiciosService.getServicios(appointment.empresa),
          ServiciosService.getVariantes(appointment.empresa),
          PromocionesService.getPromocionesEmpresa(appointment.empresa)
        ]);

        setServiciosDisponibles(servicios);
        setVariantesDisponibles(variantes);
        setPromocionesDisponibles(promociones);
      } catch (error) {
        console.error('Error cargando datos para edición:', error);
      }
    };

    cargarDatosEdicion();
  }, [isEditing, appointment]);

  // Recalcular precio cuando cambian las selecciones
  useEffect(() => {
    if (!isEditing) return;

    const calcularNuevoPrecio = () => {
      let precioBase = (servicioSeleccionado?.precio || 0) / 100;

      const precioVariantes = variantesSeleccionadas.reduce((sum, variante) => {
        return sum + ((variante.precio || 0) / 100);
      }, 0);

      precioBase += precioVariantes;

      let descuentoAcumulado = 0;
      for (const promocionId of promocionesSeleccionadas) {
        const promocion = promocionesDisponibles.find(p => p._id === promocionId);
        if (promocion && promocion.activo && promocion.tipo === 'descuento' && promocion.destino === 'servicio') {
          if (promocion.porcentaje !== null && promocion.porcentaje !== undefined) {
            descuentoAcumulado += precioBase * (promocion.porcentaje / 100);
          } else if (promocion.cifra !== undefined && promocion.cifra > 0) {
            descuentoAcumulado += promocion.cifra / 100;
          }
        }
      }

      const precioFinal = Math.max(0, precioBase - descuentoAcumulado);
      setPrecioCalculado(precioFinal);
      setDescuentoTotal(descuentoAcumulado);
    };

    calcularNuevoPrecio();
  }, [servicioSeleccionado, variantesSeleccionadas, promocionesSeleccionadas, promocionesDisponibles, isEditing]);

  // Métodos de pago
  const paymentMethods = useMemo(
    () => [
      { id: 'Pago en efectivo', name: 'Efectivo', icon: CashIcon },
      { id: 'Pago Tarjeta', name: 'Tarjeta', icon: CardIcon },
      { id: 'Monedero', name: 'Monedero', icon: WalletIcon }
    ],
    []
  );

  // Calcular importes
  const totalAsignado = Object.values(paymentAmounts).reduce((sum, amount) => sum + amount, 0);
  const importeTotal = isEditing ? precioCalculado : precioConDescuento;
  const importeRestante = Math.max(0, importeTotal - totalAsignado);
  const esPagoCompleto = Math.abs(importeRestante) < 0.01;

  // Verificar saldo del monedero
  const saldoMonedero = appointment?.usuario.saldoMonedero || 0;
  const tieneSaldoSuficiente = MonederoService.tieneSaldoSuficiente(saldoMonedero, importeTotal);

  // Callbacks
  const handleServiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const servicio = serviciosDisponibles.find(s => s._id === e.target.value);
    setServicioSeleccionado(servicio || null);
  }, [serviciosDisponibles]);

  const handleVariantChange = useCallback((variante: Variante, checked: boolean) => {
    if (checked) {
      setVariantesSeleccionadas(prev => [...prev, variante]);
    } else {
      setVariantesSeleccionadas(prev => prev.filter(v => v._id !== variante._id));
    }
  }, []);

  const handlePromocionChange = useCallback((promocionId: string, checked: boolean) => {
    if (checked) {
      setPromocionesSeleccionadas(prev => [...prev, promocionId]);
    } else {
      setPromocionesSeleccionadas(prev => prev.filter(p => p !== promocionId));
    }
  }, []);

  const cancelarCambios = useCallback(() => {
    setServicioSeleccionado(estadoOriginal.servicioSeleccionado);
    setVariantesSeleccionadas(estadoOriginal.variantesSeleccionadas);
    setPromocionesSeleccionadas(estadoOriginal.promocionesSeleccionadas);
    setPrecioCalculado(appointment?.importe || 0);
    setIsEditing(false);
  }, [estadoOriginal, appointment]);

  const handlePaymentMethodClick = useCallback((methodId: string) => {
    if (!isDividedPayment) {
      setSelectedPaymentMethod(methodId);
      setPaymentAmounts({});
    } else {
      setActiveInput(methodId);
      setInputAmount((paymentAmounts[methodId] || 0).toString());
    }
  }, [isDividedPayment, paymentAmounts]);

  const handleLongPress = useCallback((methodId: string) => {
    setIsDividedPayment(true);
    setSelectedPaymentMethod('');
    setActiveInput(methodId);
    setInputAmount('');
  }, []);

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
    if (!appointment || isProcessing) return;

    if (!isDividedPayment && !selectedPaymentMethod) return;
    if (isDividedPayment && !esPagoCompleto) return;

    setIsProcessing(true);
    try {
      // Crear appointment editado si hay cambios
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
        // Pago único
        if (selectedPaymentMethod === 'Monedero') {
          await onCompleteWalletPayment(appointment._id, editedAppointment);
        } else {
          await onCompletePayment(appointment._id, selectedPaymentMethod, editedAppointment);
        }
      } else {
        // Pago dividido
        const pagosActivos = Object.entries(paymentAmounts)
          .filter(([_, amount]) => amount > 0)
          .map(([methodId, amount]) => ({ methodId, amount }));

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
      console.error('Error al procesar pago:', error);
    } finally {
      setIsProcessing(false);
    }
  };

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Detalles de la Cita</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cliente y Información Básica */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-exora-primary/10 to-exora-primary/5 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-exora-primary mb-4">{appointment.usuario.nombre}</h3>
              <div className="space-y-2 text-sm">
                {appointment.usuario.email && (
                  <p className="text-gray-600">{appointment.usuario.email}</p>
                )}
                {appointment.usuario.telefono && (
                  <p className="text-gray-600">{appointment.usuario.telefono}</p>
                )}
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon size={16} />
                    <span className="font-bold">{formatTime(appointment.fecha)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LocationIcon size={16} />
                    <span>{appointment.sucursal.nombre}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 capitalize mt-2">{formatDate(appointment.fecha)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <ProfessionalIcon size={20} className="text-gray-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Profesional</h3>
                  <p className="text-gray-700">{appointment.profesional.nombre}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <ClockIcon size={20} className="text-gray-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Duración</h3>
                  <p className="text-gray-700">{appointment.duracion || '60'} minutos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Servicios - Con opción de editar */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <ServiceIcon size={20} className="mr-2" />
                Servicios
              </h3>
              <button
                onClick={isEditing ? cancelarCambios : () => setIsEditing(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isEditing ? '#FEE2E2' : '#DBEAFE',
                  color: isEditing ? '#DC2626' : '#2563EB'
                }}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {!isEditing ? (
              // Vista normal
              <div className="space-y-3">
                {appointment.servicios.map((servicio, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{servicio.nombre}</span>
                    <span className="text-lg font-bold text-exora-primary">
                      {((servicio.precio || 0) / 100).toFixed(2)}€
                    </span>
                  </div>
                ))}

                {variantesSeleccionadas.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <VariantIcon size={16} className="mr-2" />
                      Variantes:
                    </h4>
                    <div className="space-y-2">
                      {variantesSeleccionadas.map((variante, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-gray-700">{variante.nombre}</span>
                          <span className="text-sm font-bold text-blue-600">
                            +{((variante.precio || 0) / 100).toFixed(2)}€
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Vista de edición
              <div className="space-y-6">
                {/* Selector de servicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Servicio:</label>
                  <select
                    value={servicioSeleccionado?._id || ''}
                    onChange={handleServiceChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar servicio</option>
                    {serviciosDisponibles.map(servicio => (
                      <option key={servicio._id} value={servicio._id}>
                        {servicio.nombre} - €{((servicio.precio || 0) / 100).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variantes */}
                {variantesDisponibles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variantes:</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {variantesDisponibles.map(variante => (
                        <label key={variante._id} className="flex items-center space-x-3 p-2">
                          <input
                            type="checkbox"
                            checked={variantesSeleccionadas.some(v => v._id === variante._id)}
                            onChange={(e) => handleVariantChange(variante, e.target.checked)}
                          />
                          <span className="flex-1">{variante.nombre}</span>
                          <span className="text-sm text-gray-500">
                            +€{((variante.precio || 0) / 100).toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promociones */}
                {promocionesDisponibles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promociones:</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {promocionesDisponibles
                        .filter(p => p.activo && p.tipo === 'descuento' && p.destino === 'servicio')
                        .map(promocion => (
                          <label key={promocion._id} className="flex items-center space-x-3 p-2">
                            <input
                              type="checkbox"
                              checked={promocionesSeleccionadas.includes(promocion._id)}
                              onChange={(e) => handlePromocionChange(promocion._id, e.target.checked)}
                            />
                            <span className="flex-1">{promocion.titulo || 'Promoción'}</span>
                            <span className="text-sm text-green-600">
                              {promocion.porcentaje && `-${promocion.porcentaje}%`}
                              {promocion.cifra && `-€${((promocion.cifra || 0) / 100).toFixed(2)}`}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setPrecioConDescuento(precioCalculado);
                  }}
                  className="w-full py-3 bg-exora-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Confirmar cambios
                </button>
              </div>
            )}
          </div>

          {/* Importe Total */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isEditing ? 'Precio Estimado' : 'Importe Total'}
                </h3>
                {descuentoTotal > 0 && (
                  <p className="text-sm text-gray-600 line-through">€{appointment.importe.toFixed(2)}</p>
                )}
                <p className="text-3xl font-bold text-green-600">€{importeTotal.toFixed(2)}</p>
                {descuentoTotal > 0 && (
                  <p className="text-sm text-red-600 mt-1">Descuento: -€{descuentoTotal.toFixed(2)}</p>
                )}
              </div>
              <div className="text-right">
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
        </div>

        {/* Actions - Solo si no está pagado */}
        {!appointment.pagada && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
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
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  disabled={isProcessing}
                >
                  No Show
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Método de Pago</h3>
                  {isDividedPayment && (
                    <div className="text-sm text-gray-600">
                      Restante: €{importeRestante.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Métodos de pago */}
                <div className="grid grid-cols-3 gap-4">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    const isSelected = selectedPaymentMethod === method.id;
                    const hasAmount = paymentAmounts[method.id] > 0;
                    const isWallet = method.id === 'Monedero';
                    const isDisabled = isWallet && !tieneSaldoSuficiente;

                    return (
                      <button
                        key={method.id}
                        onClick={() => handlePaymentMethodClick(method.id)}
                        onTouchStart={(e) => {
                          if (isDisabled) return;

                          const timeoutId = setTimeout(() => {
                            handleLongPress(method.id);
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
                        className={`relative p-6 border-2 rounded-xl flex flex-col items-center space-y-3 transition-all ${
                          isDisabled
                            ? 'border-gray-300 opacity-50 cursor-not-allowed bg-gray-100'
                            : ((!isDividedPayment && isSelected) || (isDividedPayment && hasAmount))
                            ? 'border-exora-primary bg-exora-primary/10 shadow-md'
                            : 'border-gray-300 hover:border-exora-primary/50 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent size={32} className={isDisabled ? 'text-gray-400' : 'text-exora-primary'} />
                        <span className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                          {method.name}
                        </span>

                        {/* Check icon */}
                        {!isDisabled && ((!isDividedPayment && isSelected) || (isDividedPayment && hasAmount)) && (
                          <div className="absolute top-2 right-2">
                            <CheckIcon size={16} className="text-exora-primary" />
                          </div>
                        )}

                        {/* Saldo del monedero */}
                        {isWallet && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className={`text-xs px-2 py-1 rounded ${
                              tieneSaldoSuficiente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              €{saldoMonedero.toFixed(2)}
                            </div>
                          </div>
                        )}

                        {/* Cantidad asignada en modo dividido */}
                        {!isWallet && isDividedPayment && hasAmount && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="text-xs bg-exora-primary/20 text-exora-primary px-2 py-1 rounded font-bold">
                              €{paymentAmounts[method.id].toFixed(2)}
                            </div>
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
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPaymentOptions(false)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCompletePayment}
                    disabled={isDividedPayment ? !esPagoCompleto : !selectedPaymentMethod}
                    className={`flex-2 py-3 rounded-xl font-semibold transition-all ${
                      (isDividedPayment ? esPagoCompleto : selectedPaymentMethod)
                        ? 'bg-exora-primary text-white hover:opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    style={{ flexGrow: 2 }}
                  >
                    {isDividedPayment && totalAsignado > 0
                      ? `Completar Pago (€${totalAsignado.toFixed(2)})`
                      : 'Completar Pago'
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de entrada de importe */}
        {activeInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
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