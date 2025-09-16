import { create } from 'zustand';
import toast from 'react-hot-toast';
import { AppointmentState } from '../types';
import { AppointmentsService } from '../../lib/appointments';
import { formatDateForAPILocal } from '../utils/helpers';

const filterAppointments = (appointments: Appointment[], showPaidOnly: boolean) => {
  if (showPaidOnly) {
    return appointments.filter(apt => apt.pagada);
  } else {
    return appointments.filter(apt => !apt.pagada);
  }
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
      showPaidOnly: false // Reset a mostrar no pagadas por defecto
    });

    try {
      // Convert date string to ISO format for API
      const dateForAPI = new Date(date + 'T00:00:00.000Z').toISOString();

      const response = await AppointmentsService.fetchAppointments({
        empresa: "662f5bb1f956857b8cd0d9c7", // From JWT token
        fecha: dateForAPI
      });

      if (response.ok) {
        const currentState = get();
        const filtered = filterAppointments(response.citas, currentState.showPaidOnly);

        set({
          appointments: response.citas,
          filteredAppointments: filtered,
          currentDate: date,
          currentIndex: 0,
          isLoading: false,
          error: null
        });

        toast.success(`Citas cargadas: ${response.citas.length} (${filtered.length} mostradas)`);
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
    const { appointments, showPaidOnly } = get();
    const newShowPaidOnly = !showPaidOnly;
    const filtered = filterAppointments(appointments, newShowPaidOnly);

    // Solo cambiar si hay citas en el nuevo filtro
    if (filtered.length > 0) {
      set({
        showPaidOnly: newShowPaidOnly,
        filteredAppointments: filtered,
        currentIndex: 0
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));