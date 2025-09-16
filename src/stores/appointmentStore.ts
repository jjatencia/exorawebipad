import { create } from 'zustand';
import toast from 'react-hot-toast';
import { AppointmentState } from '../types';
import { AppointmentsService } from '../../lib/appointments';
import { formatDateForAPI } from '../utils/helpers';

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  currentDate: formatDateForAPI(new Date()),
  currentIndex: 0,
  isLoading: false,
  error: null,

  fetchAppointments: async (date: string) => {
    const currentState = get();

    // Avoid duplicate requests
    if (currentState.isLoading && currentState.currentDate === date) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Convert date string to ISO format for API
      const dateForAPI = new Date(date + 'T00:00:00.000Z').toISOString();

      const response = await AppointmentsService.fetchAppointments({
        empresa: "662f5bb1f956857b8cd0d9c7", // From JWT token
        fecha: dateForAPI
      });

      if (response.ok) {
        set({
          appointments: response.citas,
          currentDate: date,
          currentIndex: 0,
          isLoading: false,
          error: null
        });

        toast.success(`Citas cargadas: ${response.citas.length}`);
      } else {
        throw new Error('Error al obtener las citas');
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);

      set({
        appointments: [],
        currentDate: date,
        currentIndex: 0,
        isLoading: false,
        error: error.message || 'Error al cargar las citas'
      });

      toast.error(error.message || 'Error al cargar las citas');
    }
  },

  setCurrentIndex: (index: number) => {
    const { appointments } = get();
    if (index >= 0 && index < appointments.length) {
      set({ currentIndex: index });
    }
  },

  setCurrentDate: (date: string) => {
    set({ currentDate: date });
  },

  clearError: () => {
    set({ error: null });
  }
}));