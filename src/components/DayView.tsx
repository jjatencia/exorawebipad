import React, { useMemo } from 'react';
import { Appointment } from '../types';
import { ClockIcon, ServiceIcon, LocationIcon } from './icons';

interface DayViewProps {
  appointments: Appointment[];
  selectedDate: string;
  onAppointmentClick?: (appointment: Appointment) => void;
}

interface TimeSlot {
  hour: number;
  minute: number;
  time: string;
  fullTime: string;
}

const DayView: React.FC<DayViewProps> = ({
  appointments,
  selectedDate,
  onAppointmentClick
}) => {
  // Calcular rango dinámico basado en las citas del día
  const timeRange = useMemo(() => {
    if (appointments.length === 0) {
      return null; // Sin citas
    }

    let earliestHour = 23;
    let latestHour = 0;

    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.fecha);
      const hour = appointmentDate.getHours();
      const minute = appointmentDate.getMinutes();
      const duration = parseInt(appointment.duracion || '60');

      // Hora de inicio (redondeada hacia abajo)
      const startHour = hour;

      // Hora de fin (redondeada hacia arriba)
      const endMinutes = minute + duration;
      const endHour = hour + Math.floor(endMinutes / 60);
      const finalEndHour = endMinutes % 60 > 0 ? endHour + 1 : endHour;

      earliestHour = Math.min(earliestHour, startHour);
      latestHour = Math.max(latestHour, finalEndHour);
    });

    return { start: earliestHour, end: latestHour };
  }, [appointments]);

  // Generar slots de tiempo dinámicos
  const timeSlots = useMemo((): TimeSlot[] => {
    if (!timeRange) return [];

    const slots: TimeSlot[] = [];
    for (let hour = timeRange.start; hour <= timeRange.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === timeRange.end && minute > 0) break; // Terminar en la hora exacta final

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const fullTimeString = `${timeString}:00`;

        slots.push({
          hour,
          minute,
          time: timeString,
          fullTime: fullTimeString
        });
      }
    }
    return slots;
  }, [timeRange]);

  // Procesar citas para posicionarlas en el timeline
  const processedAppointments = useMemo(() => {
    if (!timeRange) return [];

    return appointments.map((appointment, index) => {
      const appointmentDate = new Date(appointment.fecha);
      const hour = appointmentDate.getHours();
      const minute = appointmentDate.getMinutes();

      // Usar la duración real de la cita (en minutos)
      const duration = parseInt(appointment.duracion || '60');

      // Calcular posición exacta en minutos desde el inicio del rango dinámico
      const startMinutes = (hour - timeRange.start) * 60 + minute;

      // Calcular altura proporcional (2 píxeles por minuto para mejor visualización)
      const heightPx = Math.max(40, duration * 2);

      return {
        ...appointment,
        index,
        hour,
        minute,
        startMinutes,
        durationMinutes: duration,
        heightPx,
        timeDisplay: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      };
    });
  }, [appointments, timeRange]);

  const handleAppointmentClick = (appointment: Appointment) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header del día */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {formatDate(selectedDate)}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {processedAppointments.length} citas programadas
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        {!timeRange ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No hay citas disponibles hoy</p>
              <p className="text-sm mt-2">Selecciona otra fecha para ver las citas</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline continuo */}
            <div className="relative" style={{ height: `${timeSlots.length * 60}px` }}>
            {/* Grid de horarios de fondo */}
            <div className="grid grid-cols-1 gap-0">
              {timeSlots.map((slot) => (
                <div
                  key={`${slot.hour}-${slot.minute}`}
                  className="border-b border-gray-100 h-[60px] flex"
                >
                  {/* Columna de hora */}
                  <div className="w-16 flex-shrink-0 p-2 border-r border-gray-200">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-gray-600">
                        {slot.time}
                      </span>
                      {slot.minute === 0 && (
                        <ClockIcon size={12} className="text-gray-400 mt-1" />
                      )}
                    </div>
                  </div>

                  {/* Columna de contenido */}
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>

            {/* Citas posicionadas absolutamente */}
            <div className="absolute top-0 left-16 right-0 bottom-0">
              {processedAppointments.map((appointment) => {
                // Posición vertical exacta basada en minutos reales (2px por minuto)
                const topPosition = appointment.startMinutes * 2;

                return (
                  <button
                    key={appointment._id}
                    onClick={() => handleAppointmentClick(appointment)}
                    className="absolute left-2 right-2 text-left p-2 rounded-lg transition-all duration-200 hover:shadow-md border-l-4"
                    style={{
                      top: `${topPosition}px`,
                      height: `${appointment.heightPx}px`,
                      backgroundColor: appointment.pagada ? '#F0F9FF' : '#FCFFA8',
                      borderLeftColor: appointment.profesional.color || '#555BF6',
                      zIndex: 10
                    }}
                  >
                    <div className="h-full flex flex-col justify-start overflow-hidden">
                      {/* Primera línea: Hora y Cliente - SIEMPRE VISIBLE */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          {appointment.timeDisplay}
                        </span>
                        <span className="text-xs font-semibold truncate ml-2" style={{ color: '#555BF6' }}>
                          {appointment.usuario.nombre}
                        </span>
                      </div>

                      {/* Segunda línea: Servicio - SIEMPRE VISIBLE */}
                      <div className="flex items-center space-x-1 mb-1">
                        <ServiceIcon size={10} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-700 truncate font-medium">
                          {appointment.servicios[0]?.nombre || 'Sin servicio'}
                        </span>
                      </div>

                      {/* Tercera línea: Profesional - Solo si hay espacio (>= 30min) */}
                      {appointment.durationMinutes >= 30 && (
                        <div className="text-xs text-gray-600 truncate mb-1">
                          {appointment.profesional.nombre}
                        </div>
                      )}

                      {/* Cuarta línea: Sucursal y duración - Solo si hay mucho espacio (>= 45min) */}
                      {appointment.durationMinutes >= 45 && (
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <LocationIcon size={8} />
                            <span>{appointment.sucursal.nombre}</span>
                          </div>
                          <span>({appointment.durationMinutes}min)</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Línea de tiempo actual */}
          <CurrentTimeLine selectedDate={selectedDate} timeRange={timeRange} />
        </div>
      )}
    </div>
  );
};

// Componente para mostrar la línea de tiempo actual
const CurrentTimeLine: React.FC<{ selectedDate: string; timeRange: { start: number; end: number } | null }> = ({ selectedDate, timeRange }) => {
  const currentTimePosition = useMemo(() => {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];

    // Solo mostrar si es el día actual y hay un rango definido
    if (selectedDate !== today || !timeRange) return null;

    const hour = now.getHours();
    const minute = now.getMinutes();

    // Solo mostrar si la hora actual está dentro del rango dinámico
    if (hour < timeRange.start || hour > timeRange.end) return null;

    // Calcular posición exacta en minutos desde el inicio del rango dinámico (2px por minuto)
    const totalMinutesFromStart = (hour - timeRange.start) * 60 + minute;

    return totalMinutesFromStart * 2;
  }, [selectedDate, timeRange]);

  if (currentTimePosition === null) return null;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none"
      style={{ top: `${currentTimePosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-16 flex justify-center">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
        <div className="flex-1 h-0.5 bg-red-500"></div>
      </div>
    </div>
  );
};

export default DayView;