import { create } from 'zustand';
import toast from 'react-hot-toast';
import { AppointmentState } from '../types';
import { apiService } from '../services/api';
import { MOCK_APPOINTMENTS } from '../utils/constants';
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
      const appointments = await apiService.getAppointments(date);
      
      set({
        appointments,
        currentDate: date,
        currentIndex: 0,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.warn('API not available, using mock data');
      
      // Fallback to mock data if API fails
      const mockData = MOCK_APPOINTMENTS.filter((appointment) => {
        // Filter appointments by the selected date
        return appointment.apiDate === date;
      });

      set({
        appointments: mockData,
        currentDate: date,
        currentIndex: 0,
        isLoading: false,
        error: null
      });

      toast.success(`Datos cargados: ${mockData.length} citas`);
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