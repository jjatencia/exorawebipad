import { create } from 'zustand';
import toast from 'react-hot-toast';
import { AppointmentState, Appointment } from '../types';
import { AppointmentsService } from '../services/appointmentsService';
import { formatDateForAPILocal } from '../utils/helpers';

const filterAndSortAppointments = (appointments: Appointment[]) => {
  const now = new Date();

  // Filtrar citas pagadas que ya pasaron su hora + 15 min
  const filteredAppointments = appointments.filter(appointment => {
    if (!appointment.pagada) {
      // Citas no pagadas siempre se muestran
      return true;
    }

    // Para citas pagadas, verificar si ya pasaron + 15 min
    const appointmentDateTime = new Date(appointment.fecha);
    appointmentDateTime.setMinutes(appointmentDateTime.getMinutes() + 15);

    // Si ya pasó la hora + 15 min, ocultar la cita
    return now <= appointmentDateTime;
  });

  // Ordenar por fecha/hora
  return filteredAppointments.sort((a, b) => {
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    return dateA.getTime() - dateB.getTime();
  });
};

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  filteredAppointments: [],
  currentDate: formatDateForAPILocal(new Date()),
  currentIndex: 0,
  showPaidOnly: false,
  isLoading: false,
  error: null,

  fetchAppointments: async (date: string) => {
    const currentState = get();

    // Avoid duplicate requests
    if (currentState.isLoading && currentState.currentDate === date) {
      return;
    }

    // Limpiar datos anteriores al cambiar de fecha
    set({
      isLoading: true,
      error: null,
      appointments: [],
      filteredAppointments: [],
      currentIndex: 0,
      showPaidOnly: false // Mantener por compatibilidad pero no se usa
    });

    try {
      // Convert date string to ISO format for API
      const dateForAPI = new Date(date + 'T00:00:00.000Z').toISOString();

      const response = await AppointmentsService.fetchAppointments({
        empresa: "662f5bb1f956857b8cd0d9c7", // From JWT token
        fecha: dateForAPI
      });

      if (response.ok) {
        // Filtrar y ordenar citas según las reglas de negocio
        const filteredAndSorted = filterAndSortAppointments(response.citas);

        set({
          appointments: response.citas,
          filteredAppointments: filteredAndSorted,
          currentDate: date,
          currentIndex: 0,
          isLoading: false,
          error: null
        });

        // Solo mostrar notificación si no hay citas o si hay un cambio significativo
        const hiddenCount = response.citas.length - filteredAndSorted.length;

        // Solo mostrar toast para casos específicos para reducir ruido
        if (response.citas.length === 0) {
          toast('No hay citas para este día', { icon: 'ℹ️' });
        } else if (hiddenCount > 0) {
          toast.success(`${filteredAndSorted.length} citas disponibles (${hiddenCount} finalizadas ocultas)`);
        }
      } else {
        throw new Error('Error al obtener las citas');
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);

      set({
        appointments: [],
        filteredAppointments: [],
        currentDate: date,
        currentIndex: 0,
        isLoading: false,
        error: error.message || 'Error al cargar las citas'
      });

      toast.error(error.message || 'Error al cargar las citas');
    }
  },

  setCurrentIndex: (index: number) => {
    const { filteredAppointments } = get();
    if (index >= 0 && index < filteredAppointments.length) {
      set({ currentIndex: index });
    }
  },

  setCurrentDate: (date: string) => {
    set({ currentDate: date });
  },

  toggleShowPaid: () => {
    // Esta función ya no es necesaria pero la mantenemos por compatibilidad
    // Ahora siempre mostramos todas las citas
    console.log('toggleShowPaid: Mostrando todas las citas del día');
  },

  clearError: () => {
    set({ error: null });
  }
}));
