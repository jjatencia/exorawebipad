import React, { useMemo, useState, useEffect } from 'react';
import { Appointment } from '../types';
import { ClockIcon, CalendarIcon, ShuffleIcon } from './icons';

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
  // Calculate dynamic range based on appointments
  const timeRange = useMemo(() => {
    if (appointments.length === 0) {
      return null;
    }

    let earliestHour = 23;
    let latestHour = 0;

    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.fecha);
      const hour = appointmentDate.getHours();
      const minute = appointmentDate.getMinutes();
      const duration = parseInt(appointment.duracion || '60');

      const startHour = hour;
      const endMinutes = minute + duration;
      const endHour = hour + Math.floor(endMinutes / 60);
      const finalEndHour = endMinutes % 60 > 0 ? endHour + 1 : endHour;

      earliestHour = Math.min(earliestHour, startHour);
      latestHour = Math.max(latestHour, finalEndHour);
    });

    return { start: earliestHour, end: latestHour };
  }, [appointments]);

  // Generate dynamic time slots
  const timeSlots = useMemo((): TimeSlot[] => {
    if (!timeRange) return [];

    const slots: TimeSlot[] = [];
    for (let hour = timeRange.start; hour <= timeRange.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === timeRange.end && minute > 0) break;

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

  // Process appointments for timeline positioning
  const processedAppointments = useMemo(() => {
    if (!timeRange) return [];

    return appointments.map((appointment, index) => {
      const appointmentDate = new Date(appointment.fecha);
      const hour = appointmentDate.getHours();
      const minute = appointmentDate.getMinutes();

      const duration = parseInt(appointment.duracion || '60');
      const startMinutes = (hour - timeRange.start) * 60 + minute;
      const pixelsPerMinute = 80 / 30;
      const heightPx = Math.max(40, duration * pixelsPerMinute);

      return {
        ...appointment,
        index,
        hour,
        minute,
        startMinutes,
        durationMinutes: duration,
        heightPx,
        pixelsPerMinute,
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
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-exora-primary/5 to-exora-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {formatDate(selectedDate)}
            </h2>
            <p className="text-base text-gray-600 mt-1">
              {processedAppointments.length} citas programadas
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <ClockIcon size={18} className="text-exora-primary mr-2" />
              <span className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4">
        {!timeRange ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-gray-500 bg-gray-50 p-12 rounded-2xl">
              <CalendarIcon size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium mb-2">No hay citas disponibles hoy</p>
              <p className="text-base text-gray-600">Selecciona otra fecha para ver las citas programadas</p>
            </div>
          </div>
        ) : (
          <div className="relative my-6">
            <div className="relative bg-white rounded-lg shadow-sm border border-gray-100" style={{ height: `${timeSlots.length * 80}px`, minHeight: '600px' }}>
              {/* Grid background */}
              <div className="grid grid-cols-1 gap-0">
                {timeSlots.map((slot) => (
                  <div
                    key={`${slot.hour}-${slot.minute}`}
                    className="border-b border-gray-100 h-[80px] flex hover:bg-gray-50/50 transition-colors relative"
                  >
                    <div className="w-24 flex-shrink-0 p-3 border-r border-gray-100 bg-gray-50/30">
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-sm font-semibold text-gray-700">
                          {slot.time}
                        </span>
                        {slot.minute === 0 && (
                          <div className="w-2 h-2 bg-exora-primary rounded-full mt-2 opacity-60"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <div className="absolute inset-0 border-l-2 border-gray-200 ml-6"></div>
                      {slot.minute === 15 && (
                        <div className="absolute right-0 top-1/2 w-3 h-px bg-gray-300 -translate-y-0.5"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Appointments positioned absolutely */}
              <div className="absolute top-0 left-24 right-0 bottom-0">
                {processedAppointments.map((appointment) => {
                  const topPosition = appointment.startMinutes * appointment.pixelsPerMinute;
                  const heightPx = appointment.heightPx;

                  return (
                    <button
                      key={appointment._id}
                      onClick={() => handleAppointmentClick(appointment)}
                      className="absolute left-4 right-4 text-left rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.01] group"
                      style={{
                        top: `${topPosition}px`,
                        height: `${heightPx}px`,
                        backgroundColor: appointment.pagada ? '#D2E9FF' : '#FCFFA8',
                        border: `1px solid ${appointment.pagada ? '#3B82F6' : '#F59E0B'}`,
                        borderLeft: `4px solid ${appointment.profesional.color || '#555BF6'}`,
                        zIndex: 10
                      }}
                    >
                      <div className="h-full p-3 flex flex-col overflow-hidden">
                        {appointment.isProfesionalRandom && (
                          <div className="absolute bottom-1 right-1">
                            <ShuffleIcon size={12} className="text-[#555BF6]" />
                          </div>
                        )}
                        {heightPx < 60 ? (
                          // Compact layout for short appointments
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-gray-800">
                                  {appointment.timeDisplay}
                                </span>
                                <span className="text-xs text-gray-600">({appointment.duracion || '60'}m)</span>
                                <span className="text-sm font-bold text-gray-900 truncate">
                                  {appointment.usuario.nombre} {appointment.usuario.apellidos || ''}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-700 truncate">
                              {appointment.servicios[0]?.nombre || 'Sin servicio'}
                              {appointment.servicios.length > 1 && ` +${appointment.servicios.length - 1}`}
                            </div>
                          </>
                        ) : (
                          // Normal layout for longer appointments
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-base font-bold text-gray-800">
                                  {appointment.timeDisplay}
                                </span>
                                <span className="text-sm text-gray-600">
                                  ({appointment.duracion || '60'}m)
                                </span>
                                <span className="text-base font-bold text-gray-900 truncate">
                                  {appointment.usuario.nombre} {appointment.usuario.apellidos || ''}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  appointment.pagada ? 'bg-blue-600' : 'bg-yellow-600'
                                }`}></div>
                              </div>
                            </div>

                            <div className="mb-2 flex-1">
                              <div className="text-sm font-medium text-gray-700 truncate">
                                {appointment.servicios[0]?.nombre || 'Sin servicio'}
                              </div>
                              {(appointment.servicios.length > 1 || (appointment.variantes && appointment.variantes.length > 0)) && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {appointment.servicios.length > 1 && `+${appointment.servicios.length - 1} servicios`}
                                  {appointment.servicios.length > 1 && appointment.variantes && appointment.variantes.length > 0 && ' • '}
                                  {appointment.variantes && appointment.variantes.length > 0 && `${appointment.variantes.length} variantes`}
                                </div>
                              )}
                            </div>

                            <div className="text-xs text-gray-600 mb-2">
                              <div className="truncate">{appointment.profesional.nombre}</div>
                              <div className="truncate">{appointment.sucursal.nombre}</div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-300 border-opacity-30">
                              <div className="flex items-center space-x-2 text-xs">
                                {appointment.usuario.telefono && (
                                  <span className="text-gray-600">***{appointment.usuario.telefono.slice(-3)}</span>
                                )}
                                {appointment.promocion && appointment.promocion.length > 0 && (
                                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-medium">Promo</span>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current time line */}
            <CurrentTimeLine selectedDate={selectedDate} timeRange={timeRange} />
          </div>
        )}
      </div>
    </div>
  );
};

// Current time line component
const CurrentTimeLine: React.FC<{ selectedDate: string; timeRange: { start: number; end: number } | null }> = ({ selectedDate, timeRange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentTimePosition = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    if (selectedDate !== today || !timeRange) return null;

    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();

    const extendedStart = Math.max(0, timeRange.start - 1);
    const extendedEnd = Math.min(23, timeRange.end + 1);

    if (hour < extendedStart || hour > extendedEnd) return null;

    const pixelsPerMinute = 80 / 30;
    const totalMinutesFromStart = (hour - timeRange.start) * 60 + minute;

    return totalMinutesFromStart * pixelsPerMinute;
  }, [selectedDate, timeRange, currentTime]);

  if (currentTimePosition === null) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${currentTimePosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-24 flex justify-center">
          <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="flex-1 h-1 bg-red-500 shadow-sm relative">
          <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-red-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default DayView;