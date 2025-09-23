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
  // Generar slots de tiempo de 6:00 a 22:00 cada 30 minutos
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 22 && minute > 0) break; // Terminar a las 22:00

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
  }, []);

  // Procesar citas para posicionarlas en el timeline
  const processedAppointments = useMemo(() => {
    return appointments.map((appointment, index) => {
      const appointmentDate = new Date(appointment.fecha);
      const hour = appointmentDate.getHours();
      const minute = appointmentDate.getMinutes();

      // Calcular posición en el grid (cada slot = 30min)
      const slotIndex = ((hour - 6) * 2) + (minute >= 30 ? 1 : 0);

      // Usar la duración real de la cita (en minutos)
      const duration = parseInt(appointment.duracion || '60');
      const durationSlots = Math.ceil(duration / 30);
      const heightPx = Math.max(40, (duration / 30) * 60);

      return {
        ...appointment,
        index,
        hour,
        minute,
        slotIndex,
        durationSlots,
        durationMinutes: duration,
        heightPx,
        timeDisplay: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      };
    }).filter(apt => apt.hour >= 6 && apt.hour <= 22); // Solo mostrar citas en horario de trabajo
  }, [appointments]);

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
        <div className="relative">
          {/* Grid de horarios */}
          <div className="grid grid-cols-1 gap-0">
            {timeSlots.map((slot, slotIndex) => {
              // Buscar citas que empiecen en este slot
              const appointmentsInSlot = processedAppointments.filter(
                apt => apt.slotIndex === slotIndex
              );

              return (
                <div
                  key={`${slot.hour}-${slot.minute}`}
                  className="relative border-b border-gray-100 min-h-[60px] flex"
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

                  {/* Columna de citas */}
                  <div className="flex-1 relative p-1">
                    {appointmentsInSlot.map((appointment) => (
                      <button
                        key={appointment._id}
                        onClick={() => handleAppointmentClick(appointment)}
                        className="w-full text-left p-2 rounded-lg mb-1 transition-all duration-200 hover:shadow-md border-l-4"
                        style={{
                          backgroundColor: appointment.pagada ? '#F0F9FF' : '#FCFFA8',
                          borderLeftColor: appointment.profesional.color || '#555BF6',
                          minHeight: `${appointment.heightPx}px`
                        }}
                      >
                        <div className="space-y-1">
                          {/* Hora y cliente */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                              {appointment.timeDisplay}
                            </span>
                            <span className="text-sm font-semibold" style={{ color: '#555BF6' }}>
                              {appointment.usuario.nombre}
                            </span>
                          </div>

                          {/* Servicio */}
                          <div className="flex items-center space-x-1">
                            <ServiceIcon size={12} className="text-gray-500" />
                            <span className="text-xs text-gray-700 truncate">
                              {appointment.servicios[0]?.nombre || 'Sin servicio'}
                            </span>
                          </div>

                          {/* Profesional y sucursal */}
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span className="truncate">
                              {appointment.profesional.nombre}
                            </span>
                            <div className="flex items-center space-x-1">
                              <LocationIcon size={10} />
                              <span>{appointment.sucursal.nombre}</span>
                            </div>
                          </div>

                          {/* Precio y estado */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium" style={{ color: '#555BF6' }}>
                              €{appointment.importe.toFixed(2)} ({appointment.durationMinutes}min)
                            </span>
                            {appointment.pagada && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Pagada
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* Slot vacío */}
                    {appointmentsInSlot.length === 0 && (
                      <div className="h-full min-h-[56px] flex items-center justify-center text-gray-300">
                        <span className="text-xs">Disponible</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Línea de tiempo actual */}
          <CurrentTimeLine selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar la línea de tiempo actual
const CurrentTimeLine: React.FC<{ selectedDate: string }> = ({ selectedDate }) => {
  const currentTimePosition = useMemo(() => {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];

    // Solo mostrar si es el día actual
    if (selectedDate !== today) return null;

    const hour = now.getHours();
    const minute = now.getMinutes();

    // Solo mostrar dentro del horario de trabajo (6:00-22:00)
    if (hour < 6 || hour > 22) return null;

    // Calcular posición
    const totalMinutesFromStart = (hour - 6) * 60 + minute;
    const slotHeight = 60; // Altura de cada slot de 30min
    const position = (totalMinutesFromStart / 30) * slotHeight;

    return position;
  }, [selectedDate]);

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