import { create } from 'zustand';
import toast from 'react-hot-toast';
import { AppointmentState, Appointment } from '../types';
import { AppointmentsService } from '../services/appointmentsService';
import { formatDateForAPILocal } from '../utils/helpers';

// Memoization cache for expensive filtering operations
let filterCache = new Map<string, Appointment[]>();
const CACHE_MAX_SIZE = 10;

// Request debouncing to prevent duplicate API calls
let activeRequests = new Map<string, Promise<any>>();

const filterAndSortAppointments = (appointments: Appointment[], forceRefresh = false) => {
  // Create cache key based on appointments data and current time (rounded to 5 min intervals)
  const now = new Date();
  const timeSlot = Math.floor(now.getTime() / (5 * 60 * 1000)); // 5-minute intervals
  const cacheKey = `${appointments.length}-${timeSlot}-${appointments.map(a => `${a._id}-${a.pagada}`).join(',')}`;

  // Check cache first (unless force refresh)
  if (!forceRefresh && filterCache.has(cacheKey)) {
    return filterCache.get(cacheKey)!;
  }

  // Perform expensive filtering and sorting
  const filteredAppointments = appointments.filter(appointment => {
    if (!appointment.pagada) {
      return true; // Unpaid appointments always shown
    }

    // For paid appointments, check if 15+ minutes have passed
    const appointmentDateTime = new Date(appointment.fecha);
    appointmentDateTime.setMinutes(appointmentDateTime.getMinutes() + 15);
    return now <= appointmentDateTime;
  });

  // Sort by date/time
  const result = filteredAppointments.sort((a, b) => {
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    return dateA.getTime() - dateB.getTime();
  });

  // Cache management: remove oldest entries if cache is too large
  if (filterCache.size >= CACHE_MAX_SIZE) {
    const firstKey = filterCache.keys().next().value;
    if (firstKey) {
      filterCache.delete(firstKey);
    }
  }

  // Cache the result
  filterCache.set(cacheKey, result);

  return result;
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

    // Check for active request for this date to prevent duplicates
    const requestKey = `appointments-${date}`;
    if (activeRequests.has(requestKey)) {
      return activeRequests.get(requestKey);
    }

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

    // Create and track the request promise
    const requestPromise = (async () => {
      try {
        // Convert date string to ISO format for API
        const dateForAPI = new Date(date + 'T00:00:00.000Z').toISOString();

        const response = await AppointmentsService.fetchAppointments({
          empresa: (import.meta as any).env?.VITE_COMPANY_ID || "662f5bb1f956857b8cd0d9c7",
          fecha: dateForAPI
        });

      if (response.ok) {
        // Filtrar y ordenar citas según las reglas de negocio
        const filteredAndSorted = filterAndSortAppointments(response.citas);

        // Log JSON examples for price analysis
        if (response.citas.length > 0 && (import.meta as any).env?.DEV) {
          console.log('=== EJEMPLOS JSON CITAS ===');
          response.citas.forEach((cita, index) => {
            console.log(`--- CITA ${index + 1} (${cita.usuario.nombre}) ---`);
            console.log(JSON.stringify(cita, null, 2));
          });
        }

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
    } finally {
      // Clean up active request
      activeRequests.delete(requestKey);
    }
  })();

  // Store the active request
  activeRequests.set(requestKey, requestPromise);
  return requestPromise;
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
  },

  // Performance optimization methods
  clearCache: () => {
    filterCache.clear();
    activeRequests.clear();
  },

  refreshCurrentData: () => {
    const { currentDate } = get();
    if (currentDate) {
      // Clear cache for current date and refetch
      const requestKey = `appointments-${currentDate}`;
      activeRequests.delete(requestKey);
      return get().fetchAppointments(currentDate);
    }
  }
}));
