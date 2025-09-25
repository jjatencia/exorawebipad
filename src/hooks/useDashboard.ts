import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAppointmentStore } from '../stores/appointmentStore';
import { Appointment } from '../types';

interface UseDashboardResult {
  userName: string;
  isAuthenticated: boolean;
  currentDate: string;
  isLoading: boolean;
  error: string | null;
  showPaidOnly: boolean;
  filteredAppointments: Appointment[];
  handlers: {
    changeDate: (date: string) => void;
    refreshAppointments: () => void;
    logout: () => void;
    selectAppointment: (appointment: Appointment) => void;
  };
}

export const useDashboard = (): UseDashboardResult => {
  const navigate = useNavigate();

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
      // En la versión iPad, simplemente mostrar detalles o abrir modal
      console.log('Cita seleccionada:', appointment);
      // TODO: Implementar modal de detalles de cita para iPad
    },
    []
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
    handlers: {
      changeDate,
      refreshAppointments,
      logout,
      selectAppointment
    }
  };
};