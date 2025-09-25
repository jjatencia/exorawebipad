import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useAppointmentStore } from '../stores/appointmentStore';
import { createVenta } from '../services/ventasService';
import { MonederoService } from '../services/monederoService';
import { CitasService } from '../services/citasService';
import { Appointment } from '../types';

interface UseDashboardResult {
  userName: string;
  isAuthenticated: boolean;
  currentDate: string;
  isLoading: boolean;
  error: string | null;
  showPaidOnly: boolean;
  filteredAppointments: Appointment[];
  selectedAppointment: Appointment | null;
  handlers: {
    changeDate: (date: string) => void;
    refreshAppointments: () => void;
    logout: () => void;
    selectAppointment: (appointment: Appointment) => void;
    closeAppointmentModal: () => void;
    completePayment: (appointmentId: string, metodoPago: string, editedAppointment?: Appointment) => Promise<void>;
    completeWalletPayment: (appointmentId: string, editedAppointment?: Appointment) => Promise<void>;
    markNoShow: (appointmentId: string) => Promise<void>;
  };
}

export const useDashboard = (): UseDashboardResult => {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { user, isAuthenticated, logout: logoutStore, checkAuth } = useAuthStore();

  const {
    filteredAppointments,
    currentDate,
    showPaidOnly,
    isLoading,
    error,
    fetchAppointments,
    setCurrentDate
  } = useAppointmentStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments(currentDate);
    }
  }, [currentDate, fetchAppointments, isAuthenticated]);

  // Guardar citas en localStorage para recuperación de emergencia
  useEffect(() => {
    if (filteredAppointments.length > 0) {
      const appointmentsWithTimestamp = filteredAppointments.map(apt => ({
        ...apt,
        _cached_at: new Date().toISOString()
      }));
      localStorage.setItem('exora_recent_appointments', JSON.stringify(appointmentsWithTimestamp));
    }
  }, [filteredAppointments]);

  const changeDate = useCallback(
    (newDate: string) => {
      setCurrentDate(newDate);
    },
    [setCurrentDate]
  );

  const selectAppointment = useCallback(
    (appointment: Appointment) => {
      setSelectedAppointment(appointment);
    },
    []
  );

  const closeAppointmentModal = useCallback(() => {
    setSelectedAppointment(null);
  }, []);

  const completePayment = useCallback(
    async (appointmentId: string, metodoPago: string, editedAppointment?: Appointment) => {
      const appointment = selectedAppointment || filteredAppointments.find(apt => apt._id === appointmentId);

      if (!appointment) {
        toast.error('No se encontró la cita');
        return;
      }

      try {
        toast.loading('Procesando pago...');

        const appointmentToProcess = editedAppointment || appointment;
        await createVenta(appointmentToProcess, metodoPago);

        toast.dismiss();
        toast.success('Pago completado exitosamente');
        fetchAppointments(currentDate);
      } catch (error: any) {
        toast.dismiss();
        console.error('Error al procesar el pago:', error);

        if (error.authError || error.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          logoutStore();
          navigate('/login');
        } else {
          toast.error(error.message || 'Error al procesar el pago');
        }
      }
    },
    [selectedAppointment, filteredAppointments, currentDate, fetchAppointments, logoutStore, navigate]
  );

  const completeWalletPayment = useCallback(
    async (appointmentId: string, editedAppointment?: Appointment) => {
      const appointment = selectedAppointment || filteredAppointments.find(apt => apt._id === appointmentId);

      if (!appointment) {
        toast.error('No se encontró la cita');
        return;
      }

      try {
        toast.loading('Procesando pago con monedero...');

        const appointmentToProcess = editedAppointment || appointment;

        if (!MonederoService.tieneSaldoSuficiente(appointmentToProcess.usuario.saldoMonedero, appointmentToProcess.importe)) {
          toast.dismiss();
          toast.error('Saldo insuficiente en el monedero');
          return;
        }

        await MonederoService.procesarPagoMonedero(
          appointmentToProcess.usuario._id,
          appointmentToProcess.empresa,
          appointmentToProcess._id,
          appointmentToProcess.importe
        );

        toast.dismiss();
        toast.success('Pago con monedero completado exitosamente');
        fetchAppointments(currentDate);
      } catch (error: any) {
        toast.dismiss();
        console.error('Error al procesar el pago con monedero:', error);

        if (error.authError || error.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          logoutStore();
          navigate('/login');
        } else {
          toast.error(error.message || 'Error al procesar el pago con monedero');
        }
      }
    },
    [selectedAppointment, filteredAppointments, currentDate, fetchAppointments, logoutStore, navigate]
  );

  const markNoShow = useCallback(
    async (appointmentId: string) => {
      const appointment = selectedAppointment || filteredAppointments.find(apt => apt._id === appointmentId);

      if (!appointment) {
        toast.error('No se encontró la cita');
        return;
      }

      try {
        toast.loading('Marcando como no presentado...');
        await CitasService.marcarNoPresentado(appointment);
        toast.dismiss();
        toast.success('Cita marcada como no presentado');
        fetchAppointments(currentDate);
      } catch (error: any) {
        toast.dismiss();
        console.error('Error marcando cita como no presentado:', error);

        if (error.authError || error.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          logoutStore();
          navigate('/login');
        } else {
          toast.error(error.message || 'Error al marcar cita como no presentado');
        }
      }
    },
    [selectedAppointment, filteredAppointments, currentDate, fetchAppointments, logoutStore, navigate]
  );

  const refreshAppointments = useCallback(() => {
    fetchAppointments(currentDate);
  }, [currentDate, fetchAppointments]);

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

  return {
    userName: resolvedUserName,
    isAuthenticated,
    currentDate,
    isLoading,
    error,
    showPaidOnly,
    filteredAppointments,
    selectedAppointment,
    handlers: {
      changeDate,
      refreshAppointments,
      logout,
      selectAppointment,
      closeAppointmentModal,
      completePayment,
      completeWalletPayment,
      markNoShow
    }
  };
};