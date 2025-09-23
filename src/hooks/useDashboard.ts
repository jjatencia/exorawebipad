import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useAppointmentStore } from '../stores/appointmentStore';
// import { formatDateForAPILocal } from '../utils/helpers'; // No longer needed after removing date restriction
import { createVenta } from '../services/ventasService';
import { Appointment, ViewMode } from '../types';

interface UseDashboardResult {
  userName: string;
  isAuthenticated: boolean;
  paymentMode: boolean;
  currentDate: string;
  currentIndex: number;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
  showPaidOnly: boolean;
  filteredAppointments: Appointment[];
  canGoBack: boolean;
  canGoForward: boolean;
  handlers: {
    changeDate: (date: string) => void;
    changeViewMode: (mode: ViewMode) => void;
    nextAppointment: () => void;
    previousAppointment: () => void;
    refreshAppointments: () => void;
    initiatePaymentMode: () => void;
    completePayment: (appointmentId: string, metodoPago: string, editedAppointment?: Appointment) => Promise<void>;
    cancelPayment: () => void;
    logout: () => void;
    selectAppointment: (appointment: Appointment) => void;
  };
}

export const useDashboard = (): UseDashboardResult => {
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState(false);

  const { user, isAuthenticated, logout: logoutStore, checkAuth } = useAuthStore();

  const {
    filteredAppointments,
    currentDate,
    currentIndex,
    viewMode,
    showPaidOnly,
    isLoading,
    error,
    fetchAppointments,
    setCurrentIndex,
    setCurrentDate,
    setViewMode,
    toggleShowPaid
  } = useAppointmentStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Comentado: Este efecto causaba loops infinitos al forzar fechas pasadas a cambiar a hoy
  // useEffect(() => {
  //   const now = new Date();
  //   const today = formatDateForAPILocal(now);

  //   if (currentDate < today) {
  //     setCurrentDate(today);
  //   }
  // }, [currentDate, setCurrentDate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments(currentDate);
    }
  }, [currentDate, fetchAppointments, isAuthenticated]);

  const changeDate = useCallback(
    (newDate: string) => {
      setCurrentDate(newDate);
    },
    [setCurrentDate]
  );

  const changeViewMode = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      // Cerrar modo pago al cambiar vista
      if (paymentMode) {
        setPaymentMode(false);
      }
    },
    [setViewMode, paymentMode]
  );

  const selectAppointment = useCallback(
    (appointment: Appointment) => {
      // Encontrar el índice en la lista filtrada
      const appointmentIndex = filteredAppointments.findIndex(apt => apt._id === appointment._id);
      if (appointmentIndex !== -1) {
        setCurrentIndex(appointmentIndex);
        // Si no está en modo pago y la cita no está pagada, activar modo pago
        if (!paymentMode && !appointment.pagada) {
          setPaymentMode(true);
        }
      }
    },
    [filteredAppointments, setCurrentIndex, paymentMode]
  );

  const nextAppointment = useCallback(() => {
    if (currentIndex < filteredAppointments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, filteredAppointments.length, setCurrentIndex]);

  const previousAppointment = useCallback(() => {
    if (currentIndex > 0 && currentIndex <= filteredAppointments.length - 1) {
      setCurrentIndex(currentIndex - 1);
      return;
    }

    if (!showPaidOnly && currentIndex === 0) {
      toggleShowPaid();
    }
  }, [currentIndex, filteredAppointments.length, showPaidOnly, setCurrentIndex, toggleShowPaid]);

  const refreshAppointments = useCallback(() => {
    fetchAppointments(currentDate);
  }, [currentDate, fetchAppointments]);

  const resetPaymentMode = useCallback(() => {
    setPaymentMode(false);
  }, []);

  const initiatePaymentMode = useCallback(() => {
    if (paymentMode) {
      resetPaymentMode();
      return;
    }

    if (filteredAppointments.length === 0) {
      toast.error('No hay citas disponibles');
      return;
    }

    const appointment = filteredAppointments[currentIndex];

    if (!appointment) {
      toast.error('No se encontró la cita');
      return;
    }

    if (appointment.pagada) {
      toast.error('Esta cita ya está pagada');
      return;
    }

    setPaymentMode(true);
  }, [currentIndex, filteredAppointments, paymentMode, resetPaymentMode]);

  const completePayment = useCallback(
    async (_appointmentId: string, metodoPago: string, editedAppointment?: Appointment) => {
      const currentAppointment = filteredAppointments[currentIndex];

      if (!currentAppointment) {
        toast.error('No se encontró la cita');
        return;
      }

      try {
        toast.loading('Procesando pago...');

        // Usar la cita editada si está disponible, caso contrario usar la original
        const appointmentToProcess = editedAppointment || currentAppointment;

        await createVenta(appointmentToProcess, metodoPago);

        toast.dismiss();
        toast.success('Pago completado exitosamente');
        resetPaymentMode();
        fetchAppointments(currentDate);
      } catch (error: any) {
        toast.dismiss();
        console.error('Error al procesar el pago:', error);

        // Handle auth errors gracefully
        if (error.authError || error.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          logoutStore();
          navigate('/login');
        } else {
          toast.error(error.message || 'Error al procesar el pago');
        }
      }
    },
    [currentDate, currentIndex, filteredAppointments, fetchAppointments, resetPaymentMode, logoutStore, navigate]
  );

  const cancelPayment = useCallback(() => {
    resetPaymentMode();
    toast('Pago cancelado');
  }, [resetPaymentMode]);

  const logout = useCallback(() => {
    logoutStore();
    navigate('/login');
  }, [logoutStore, navigate]);

  const resolvedUserName = useMemo(() => {
    if (!user) {
      return 'Usuario';
    }

    if ('name' in user && user.name) {
      return user.name;
    }

    const legacyUser = user as unknown as { nombre?: string };
    return legacyUser.nombre || 'Usuario';
  }, [user]);

  const canGoBack = useMemo(() => currentIndex > 0 && !paymentMode, [currentIndex, paymentMode]);
  const canGoForward = useMemo(
    () => currentIndex < filteredAppointments.length - 1 && !paymentMode,
    [currentIndex, filteredAppointments.length, paymentMode]
  );

  return {
    userName: resolvedUserName,
    isAuthenticated,
    paymentMode,
    currentDate,
    currentIndex,
    viewMode,
    isLoading,
    error,
    showPaidOnly,
    filteredAppointments,
    canGoBack,
    canGoForward,
    handlers: {
      changeDate,
      changeViewMode,
      nextAppointment,
      previousAppointment,
      refreshAppointments,
      initiatePaymentMode,
      completePayment,
      cancelPayment,
      logout,
      selectAppointment
    }
  };
};
